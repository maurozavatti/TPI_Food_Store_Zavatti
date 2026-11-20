from datetime import datetime
from typing import Dict, List, Optional, Tuple

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from .models import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    model = Pedido

    def list_by_usuario(
        self, usuario_id: Optional[int], skip: int, limit: int, estado: Optional[str] = None
    ) -> Tuple[int, List[Pedido]]:
        """Pedidos de un usuario (o de todos si usuario_id es None), más nuevos primero."""
        consulta = select(Pedido)
        if usuario_id is not None:
            consulta = consulta.where(Pedido.usuario_id == usuario_id)
        if estado is not None:
            consulta = consulta.where(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(consulta.subquery())).one()
        items = self.session.exec(consulta.order_by(col(Pedido.id).desc()).offset(skip).limit(limit)).all()
        return total, list(items)

    def count_by_estado(self) -> Dict[str, int]:
        """{'PENDIENTE': 3, 'ENTREGADO': 5, ...} con func.count agrupado por estado."""
        filas = self.session.exec(select(Pedido.estado, func.count()).group_by(Pedido.estado)).all()
        return {estado: cantidad for estado, cantidad in filas}

    def count_desde(self, desde: datetime) -> int:
        return self.session.exec(select(func.count()).where(Pedido.created_at >= desde)).one()

    def sum_total_por_estado(self, estado: str) -> float:
        return float(self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == estado)).one())

    def add_detalle(self, detalle: DetallePedido) -> DetallePedido:
        self.session.add(detalle)
        self.session.flush()
        return detalle