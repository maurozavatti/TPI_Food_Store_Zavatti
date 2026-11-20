from typing import List, Optional, Tuple

from sqlmodel import col, delete, select

from app.core.repository import BaseRepository
from .models import DetallePedido, EstadoPedido, FormaPago, HistorialEstadoPedido, Pedido


class EstadoPedidoRepository(BaseRepository[EstadoPedido]):
    model = EstadoPedido

    def listar(self) -> List[EstadoPedido]:
        return list(self.session.exec(select(EstadoPedido).order_by(EstadoPedido.orden)).all())


class FormaPagoRepository(BaseRepository[FormaPago]):
    model = FormaPago

    def listar(self) -> List[FormaPago]:
        return list(self.session.exec(select(FormaPago).order_by(FormaPago.codigo)).all())


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def listar(
        self, offset: int, limit: int, estado_codigo: Optional[str], incluir_inactivos: bool, usuario_id: Optional[int] = None,
    ) -> Tuple[int, List[Pedido]]:
        consulta = select(Pedido)
        if usuario_id is not None:  # solo los pedidos de ese usuario
            consulta = consulta.where(Pedido.usuario_id == usuario_id)
        if estado_codigo:
            consulta = consulta.where(Pedido.estado_codigo == estado_codigo.upper())
        return self.paginar(consulta.order_by(col(Pedido.id).desc()), offset, limit)

    # ---------- Detalles ----------
    def detalles_de(self, pedido_id: int) -> List[DetallePedido]:
        consulta = select(DetallePedido).where(DetallePedido.pedido_id == pedido_id).order_by(DetallePedido.created_at)
        return list(self.session.exec(consulta).all())

    def get_detalle(self, pedido_id: int, producto_id: int) -> Optional[DetallePedido]:
        return self.session.get(DetallePedido, (pedido_id, producto_id))

    def agregar_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle

    def quitar_detalle(self, pedido_id: int, producto_id: int) -> None:
        self.session.exec(
            delete(DetallePedido).where(
                DetallePedido.pedido_id == pedido_id, DetallePedido.producto_id == producto_id
            )
        )
        self.session.flush()

    # ---------- Historial (append-only) ----------
    def registrar_historial(self, registro: HistorialEstadoPedido) -> HistorialEstadoPedido:
        self.session.add(registro)
        self.session.flush()
        return registro

    def historial_de(self, pedido_id: int) -> List[HistorialEstadoPedido]:
        consulta = (
            select(HistorialEstadoPedido)
            .where(HistorialEstadoPedido.pedido_id == pedido_id)
            .order_by(col(HistorialEstadoPedido.created_at), col(HistorialEstadoPedido.id))
        )
        return list(self.session.exec(consulta).all())