from typing import List, Optional, Tuple

from sqlmodel import col, func, select

from app.core.base_repository import BaseRepository
from .models import Producto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def search(
        self,
        skip: int,
        limit: int,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> Tuple[int, List[Producto]]:
        """Listado paginado de productos ACTIVOS con filtros opcionales. Devuelve (total, página)."""
        consulta = select(Producto).where(Producto.activo == True)  # noqa: E712
        if search:
            consulta = consulta.where(col(Producto.nombre).ilike(f"%{search.strip()}%"))  # sin distinguir mayúsculas
        if categoria_id is not None:
            consulta = consulta.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            consulta = consulta.where(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(consulta.subquery())).one()
        items = self.session.exec(consulta.order_by(Producto.id).offset(skip).limit(limit)).all()
        return total, list(items)