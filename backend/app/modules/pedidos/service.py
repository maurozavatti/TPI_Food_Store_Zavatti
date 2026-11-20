from datetime import datetime, time, timezone
from typing import Dict, Optional, Set

from app.core.utils import utc_now
from app.modules.usuarios.schemas import UserPublic
from .models import DetallePedido, Pedido
from .schemas import CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork


# ---------- Excepciones de dominio (el Router las traduce a HTTP) ----------
class PedidoNoEncontrado(Exception):
    """→ 404"""


class ProductoNoEncontrado(Exception):
    """→ 404 (no existe o está dado de baja)"""


class PedidoAjeno(Exception):
    """→ 403"""


class ReglaDeNegocio(Exception):
    """Base de las reglas que responden 400."""


class StockInsuficiente(ReglaDeNegocio):
    pass


class ProductoNoDisponible(ReglaDeNegocio):
    pass


class ProductoRepetido(ReglaDeNegocio):
    pass


class TransicionInvalida(ReglaDeNegocio):
    pass


# ---------- RN-02: máquina de estados ----------
E = EstadoPedido
TRANSICIONES: Dict[EstadoPedido, Set[EstadoPedido]] = {
    E.PENDIENTE: {E.EN_PREPARACION, E.CANCELADO},
    E.EN_PREPARACION: {E.ENTREGADO, E.CANCELADO},
    E.ENTREGADO: set(),  # terminal
    E.CANCELADO: set(),  # terminal
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork) -> None:
        self.uow = uow

    # ---------- RN-01: crear el pedido (todo o nada) ----------
    def crear(self, usuario: UserPublic, datos: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]
            if len(ids) != len(set(ids)):
                raise ProductoRepetido("Hay productos repetidos en el pedido")

            pedido = uow.pedidos.add(
                Pedido(
                    usuario_id=usuario.id,
                    estado=E.PENDIENTE.value,
                    forma_pago=datos.forma_pago.value,
                    direccion_entrega=datos.direccion_entrega.strip(),
                    notas=datos.notas,
                    total=0,
                )
            )

            total = 0.0
            for item in datos.items:
                producto = uow.productos.get_by_id(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"'{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f"Stock insuficiente de '{producto.nombre}' (quedan {producto.stock})")

                producto.stock -= item.cantidad  # se descuenta en la MISMA transacción
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                uow.pedidos.add_detalle(
                    DetallePedido(
                        pedido_id=pedido.id,
                        producto_id=producto.id,
                        cantidad=item.cantidad,
                        nombre_producto=producto.nombre,  # copia
                        precio_unitario=producto.precio_base,  # copia
                        subtotal=subtotal,
                    )
                )
                total += subtotal

            pedido.total = round(total, 2)
            uow.pedidos.add(pedido)  # el refresh trae también las líneas
            return PedidoRead.model_validate(pedido)
        # si algo lanzó una excepción, el __exit__ hace rollback: ni pedido ni descuento de stock

    # ---------- Consultas ----------
    def listar(self, usuario: UserPublic, skip: int, limit: int, estado: Optional[EstadoPedido]) -> PedidosPaginados:
        """RN-04: el user ve solo los suyos; el admin, todos."""
        with self.uow as uow:
            usuario_id = None if usuario.role == "admin" else usuario.id
            total, items = uow.pedidos.list_by_usuario(usuario_id, skip, limit, estado.value if estado else None)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in items])

    def obtener(self, usuario: UserPublic, id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, id)
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            return PedidoRead.model_validate(pedido)

    # ---------- RN-02 / RN-03: cambiar estado (admin) ----------
    def cambiar_estado(self, id: int, datos: CambioEstado) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, id)
            self._transicionar(uow, pedido, datos.estado)
            return PedidoRead.model_validate(pedido)

    # ---------- RN-03 / RN-04: el dueño cancela su pedido PENDIENTE ----------
    def cancelar(self, usuario: UserPublic, id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar(uow, id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("El pedido pertenece a otro usuario")
            if pedido.estado != E.PENDIENTE.value:
                raise TransicionInvalida("Solo se puede cancelar un pedido en estado PENDIENTE")
            self._transicionar(uow, pedido, E.CANCELADO)
            return PedidoRead.model_validate(pedido)

    # ---------- Resumen del panel ----------
    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            conteos = uow.pedidos.count_by_estado()
            inicio_hoy = datetime.combine(utc_now().date(), time.min, tzinfo=timezone.utc)
            return ResumenPedidos(
                pendientes=conteos.get(E.PENDIENTE.value, 0),
                en_preparacion=conteos.get(E.EN_PREPARACION.value, 0),
                entregados=conteos.get(E.ENTREGADO.value, 0),
                cancelados=conteos.get(E.CANCELADO.value, 0),
                pedidos_hoy=uow.pedidos.count_desde(inicio_hoy),
                ingresos_entregados=round(uow.pedidos.sum_total_por_estado(E.ENTREGADO.value), 2),
            )

    # ---------- Auxiliares ----------
    @staticmethod
    def _buscar(uow: PedidoUnitOfWork, id: int) -> Pedido:
        pedido = uow.pedidos.get_by_id(id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    @staticmethod
    def _transicionar(uow: PedidoUnitOfWork, pedido: Pedido, nuevo: EstadoPedido) -> None:
        """Valida la transición ANTES de modificar el pedido; si cancela, restituye el stock."""
        actual = EstadoPedido(pedido.estado)
        if nuevo not in TRANSICIONES[actual]:
            raise TransicionInvalida(f"No se puede pasar de {actual.value} a {nuevo.value}")

        if nuevo == E.CANCELADO:  # RN-03: devolver el stock de cada línea, en la misma transacción
            for detalle in pedido.items:
                producto = uow.productos.get_by_id(detalle.producto_id)
                if producto is not None:
                    producto.stock += detalle.cantidad
                    uow.productos.add(producto)

        pedido.estado = nuevo.value
        pedido.updated_at = utc_now()
        uow.pedidos.add(pedido)


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())