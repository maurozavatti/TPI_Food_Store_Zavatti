from typing import List, Optional, Tuple

from sqlmodel import col, func, select

from app.core.repository import BaseRepository
from app.modules.producto.models import Producto, ProductoCategoria
from .models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    model = Categoria

    def buscar_por_nombre_activo(self, nombre: str) -> Optional[Categoria]:
        # Comparación sin mayúsculas ni espacios externos, solo entre activas
        consulta = select(Categoria).where(
            func.lower(func.trim(Categoria.nombre)) == nombre.strip().lower(),
            col(Categoria.deleted_at).is_(None),
        )
        return self.session.exec(consulta).first()

    def listar(
        self, offset: int, limit: int, nombre: Optional[str], incluir_inactivos: bool
    ) -> Tuple[int, List[Categoria]]:
        consulta = select(Categoria)
        if not incluir_inactivos:
            consulta = consulta.where(col(Categoria.deleted_at).is_(None))
        if nombre:
            consulta = consulta.where(col(Categoria.nombre).ilike(f"%{nombre}%"))
        return self.paginar(consulta.order_by(Categoria.id), offset, limit)

    def contar_productos_activos(self, categoria_id: int) -> int:
        consulta = (
            select(func.count())
            .select_from(ProductoCategoria)
            .join(Producto, col(Producto.id) == ProductoCategoria.producto_id)
            .where(ProductoCategoria.categoria_id == categoria_id, col(Producto.deleted_at).is_(None))
        )
        return self.session.exec(consulta).one()

    def productos_activos(self, categoria_id: int) -> List[Producto]:
        consulta = (
            select(Producto)
            .join(ProductoCategoria, col(Producto.id) == ProductoCategoria.producto_id)
            .where(ProductoCategoria.categoria_id == categoria_id, col(Producto.deleted_at).is_(None))
            .order_by(Producto.id)
        )
        return list(self.session.exec(consulta).all())