from decimal import Decimal
from typing import List, Optional, Tuple

from app.core.exceptions import BusinessRuleError, ConflictError, NotFoundError
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.schemas import UserPublic
from app.modules.producto.models import Producto
from .models import DetallePedido, HistorialEstadoPedido, Pedido
from .schemas import (
    DetallePedidoCreate,
    DetallePedidoRead,
    EstadoPedidoRead,
    FormaPagoRead,
    HistorialEstadoRead,
    PedidoCreate,
    PedidoEstadoUpdate,
    PedidoPaginatedResponse,
    PedidoRead,
)

ESTADO_INICIAL = "PENDIENTE"
ESTADO_CANCELADO = "CANCELADO"


def _dinero(valor) -> Decimal:
    """Convierte a Decimal con 2 decimales (nunca float para plata)."""
    return Decimal(str(valor)).quantize(Decimal("0.01"))


# ---------------------------------------------------------
# Helpers
# ---------------------------------------------------------
def _es_admin(usuario: UserPublic) -> bool:
    return usuario.role == "admin"


def _obtener_o_404(uow: UnitOfWork, id: int, usuario: UserPublic) -> Pedido:
    pedido = uow.pedidos.get_activo(id)
    # Un "user" solo ve SUS pedidos. Si es de otro, respondemos 404 (no revelamos que existe)
    if not pedido or (not _es_admin(usuario) and pedido.usuario_id != usuario.id):
        raise NotFoundError("Pedido no encontrado")  # RN-13
    return pedido


def _to_read(uow: UnitOfWork, pedido: Pedido) -> PedidoRead:
    detalles = [DetallePedidoRead.model_validate(d) for d in uow.pedidos.detalles_de(pedido.id)]
    return PedidoRead.model_validate(pedido, update={"detalles": detalles})


def _validar_producto(uow: UnitOfWork, producto_id: int) -> Producto:
    producto = uow.productos.get_activo(producto_id)
    if not producto:
        raise NotFoundError(f"Producto {producto_id} no encontrado")
    if not producto.disponible:
        raise ConflictError(f"El producto '{producto.nombre}' no está disponible")
    return producto


def _armar_detalle(pedido_id: int, producto: Producto, item: DetallePedidoCreate) -> DetallePedido:
    """Crea el detalle con un SNAPSHOT del producto: nombre y precio al momento de la compra."""
    precio = _dinero(producto.precio_base)
    return DetallePedido(
        pedido_id=pedido_id,
        producto_id=producto.id,
        cantidad=item.cantidad,
        nombre_producto_snap=producto.nombre,
        precio_unitario_snap=precio,
        subtotal_snap=precio * item.cantidad,
        personalizacion=item.personalizacion,
    )


def _calcular_total(subtotal: Decimal, descuento: Decimal, costo_envio: Decimal) -> Decimal:
    total = subtotal - descuento + costo_envio
    if total < 0:
        raise BusinessRuleError("El descuento no puede superar el subtotal más el envío")
    return total


def _recalcular_totales(uow: UnitOfWork, pedido: Pedido) -> None:
    subtotal = sum((d.subtotal_snap for d in uow.pedidos.detalles_de(pedido.id)), Decimal("0"))
    total = _calcular_total(subtotal, _dinero(pedido.descuento), _dinero(pedido.costo_envio))
    uow.pedidos.update(pedido, {"subtotal": subtotal, "total": total})


def _exigir_pendiente(pedido: Pedido) -> None:
    if pedido.estado_codigo != ESTADO_INICIAL:
        raise ConflictError(
            f"Solo se pueden modificar los detalles de un pedido {ESTADO_INICIAL} "
            f"(estado actual: {pedido.estado_codigo})"
        )


# ---------------------------------------------------------
# Catálogos
# ---------------------------------------------------------
def listar_estados(uow: UnitOfWork) -> List[EstadoPedidoRead]:
    with uow:
        return [EstadoPedidoRead.model_validate(e) for e in uow.estados_pedido.listar()]


def listar_formas_pago(uow: UnitOfWork) -> List[FormaPagoRead]:
    with uow:
        return [FormaPagoRead.model_validate(f) for f in uow.formas_pago.listar()]


# ---------------------------------------------------------
# Pedido: CRUD
# ---------------------------------------------------------
def listar(
    uow: UnitOfWork,
    offset: int,
    limit: int,
    estado_codigo: Optional[str],
    incluir_inactivos: bool,
    usuario: UserPublic,
) -> PedidoPaginatedResponse:
    with uow:
        # admin ve todos los pedidos; un "user", solo los propios
        filtro_usuario = None if _es_admin(usuario) else usuario.id
        total, items = uow.pedidos.listar(offset, limit, estado_codigo, incluir_inactivos, filtro_usuario)
        return PedidoPaginatedResponse(
            total=total, offset=offset, limit=limit, items=[_to_read(uow, p) for p in items]
        )


def obtener(uow: UnitOfWork, id: int, usuario: UserPublic) -> PedidoRead:
    with uow:
        return _to_read(uow, _obtener_o_404(uow, id, usuario))


def crear(uow: UnitOfWork, data: PedidoCreate, usuario: UserPublic) -> PedidoRead:
    with uow:
        # 1) Validaciones (antes de escribir nada)
        forma_pago = uow.formas_pago.get(data.forma_pago_codigo.upper())
        if not forma_pago or not forma_pago.activo:
            raise NotFoundError(f"Forma de pago '{data.forma_pago_codigo}' no encontrada")

        ids = [d.producto_id for d in data.detalles]
        if len(ids) != len(set(ids)):
            raise BusinessRuleError("Un mismo producto no puede repetirse en el pedido (sumá la cantidad)")

        items: List[Tuple[Producto, DetallePedidoCreate]] = [
            (_validar_producto(uow, d.producto_id), d) for d in data.detalles
        ]

        # 2) Totales (snapshot monetario)
        subtotal = sum((_dinero(p.precio_base) * d.cantidad for p, d in items), Decimal("0"))
        descuento, costo_envio = _dinero(data.descuento), _dinero(data.costo_envio)
        total = _calcular_total(subtotal, descuento, costo_envio)

        # 3) Escritura: pedido + detalles + historial en UNA transacción
        pedido = uow.pedidos.add(
            Pedido(
                usuario_id=usuario.id,  # el dueño es el usuario logueado
                direccion_id=data.direccion_id,
                estado_codigo=ESTADO_INICIAL,
                forma_pago_codigo=forma_pago.codigo,
                subtotal=subtotal,
                descuento=descuento,
                costo_envio=costo_envio,
                total=total,
                notas=data.notas,
            )
        )
        for producto, item in items:
            uow.pedidos.agregar_detalle(_armar_detalle(pedido.id, producto, item))

        uow.pedidos.registrar_historial(
            HistorialEstadoPedido(
                pedido_id=pedido.id,
                estado_desde=None,  # NULL = transición inicial
                estado_hacia=ESTADO_INICIAL,
                usuario_id=usuario.id,
                motivo="Creación del pedido",
            )
        )
        return _to_read(uow, pedido)


def cambiar_estado(uow: UnitOfWork, id: int, data: PedidoEstadoUpdate, admin: UserPublic) -> PedidoRead:
    with uow:
        pedido = _obtener_o_404(uow, id, admin)
        actual = uow.estados_pedido.get(pedido.estado_codigo)
        nuevo = uow.estados_pedido.get(data.estado_codigo.upper())
        if not nuevo:
            raise NotFoundError(f"Estado '{data.estado_codigo}' no existe")

        # Reglas de transición
        if actual.es_terminal:
            raise ConflictError(f"El pedido está {actual.codigo} (estado terminal) y no puede cambiar")
        if nuevo.codigo == actual.codigo:
            raise ConflictError(f"El pedido ya está en estado {actual.codigo}")
        if nuevo.codigo != ESTADO_CANCELADO and nuevo.orden != actual.orden + 1:
            raise ConflictError(f"Transición inválida: {actual.codigo} → {nuevo.codigo}")

        uow.pedidos.update(pedido, {"estado_codigo": nuevo.codigo})
        uow.pedidos.registrar_historial(
            HistorialEstadoPedido(
                pedido_id=pedido.id,
                estado_desde=actual.codigo,
                estado_hacia=nuevo.codigo,
                usuario_id=admin.id,  # quién hizo el cambio
                motivo=data.motivo,
            )
        )
        return _to_read(uow, pedido)


def eliminar(uow: UnitOfWork, id: int, admin: UserPublic) -> None:
    with uow:
        uow.pedidos.soft_delete(_obtener_o_404(uow, id, admin))


def historial(uow: UnitOfWork, id: int, usuario: UserPublic) -> List[HistorialEstadoRead]:
    with uow:
        _obtener_o_404(uow, id, usuario)
        return [HistorialEstadoRead.model_validate(h) for h in uow.pedidos.historial_de(id)]


# ---------------------------------------------------------
# DetallePedido (filas inmutables: se agregan o se quitan, no se editan)
# ---------------------------------------------------------
def listar_detalles(uow: UnitOfWork, id: int, usuario: UserPublic) -> List[DetallePedidoRead]:
    with uow:
        _obtener_o_404(uow, id, usuario)
        return [DetallePedidoRead.model_validate(d) for d in uow.pedidos.detalles_de(id)]


def agregar_detalle(uow: UnitOfWork, id: int, item: DetallePedidoCreate, usuario: UserPublic) -> PedidoRead:
    with uow:
        pedido = _obtener_o_404(uow, id, usuario)
        _exigir_pendiente(pedido)
        if uow.pedidos.get_detalle(id, item.producto_id):
            raise ConflictError(f"El producto {item.producto_id} ya está en el pedido")
        producto = _validar_producto(uow, item.producto_id)
        uow.pedidos.agregar_detalle(_armar_detalle(id, producto, item))
        _recalcular_totales(uow, pedido)
        return _to_read(uow, pedido)


def quitar_detalle(uow: UnitOfWork, id: int, producto_id: int, usuario: UserPublic) -> PedidoRead:
    with uow:
        pedido = _obtener_o_404(uow, id, usuario)
        _exigir_pendiente(pedido)
        if not uow.pedidos.get_detalle(id, producto_id):
            raise NotFoundError(f"El producto {producto_id} no está en el pedido")
        if len(uow.pedidos.detalles_de(id)) == 1:
            raise BusinessRuleError("Un pedido debe tener al menos un detalle")  # RN-12
        uow.pedidos.quitar_detalle(id, producto_id)
        _recalcular_totales(uow, pedido)
        return _to_read(uow, pedido)