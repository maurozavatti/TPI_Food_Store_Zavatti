from typing import List, Optional, Tuple

from sqlmodel import col, delete, select

from app.core.repository import BaseRepository
from app.modules.categoria.models import Categoria
from app.modules.ingrediente.models import Ingrediente
from .models import Producto, ProductoCategoria, ProductoIngrediente
from .schemas import IngredienteEnProducto


class ProductoRepository(BaseRepository[Producto]):
    model = Producto

    def listar(
        self,
        offset: int,
        limit: int,
        nombre: Optional[str],
        incluir_inactivos: bool,
        categoria_id: Optional[int] = None,
    ) -> Tuple[int, List[Producto]]:
        consulta = select(Producto)
        if not incluir_inactivos:
            consulta = consulta.where(col(Producto.deleted_at).is_(None))
        if nombre:
            consulta = consulta.where(col(Producto.nombre).ilike(f"%{nombre}%"))
        if categoria_id:
            consulta = consulta.join(ProductoCategoria).where(ProductoCategoria.categoria_id == categoria_id)
        return self.paginar(consulta.order_by(Producto.id), offset, limit)

    # ---------- Relaciones ----------
    def reemplazar_categorias(self, producto_id: int, categoria_ids: List[int]) -> None:
        # Borra solo filas de la tabla INTERMEDIA (no entidades) y vuelve a insertar
        self.session.exec(delete(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id))
        for i, cat_id in enumerate(dict.fromkeys(categoria_ids)):  # sin repetidos, mantiene el orden
            self.session.add(ProductoCategoria(producto_id=producto_id, categoria_id=cat_id, es_principal=(i == 0)))
        self.session.flush()

    def reemplazar_ingredientes(self, producto_id: int, ingredientes: List[IngredienteEnProducto]) -> None:
        self.session.exec(delete(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id))
        for item in ingredientes:
            self.session.add(ProductoIngrediente(producto_id=producto_id, **item.model_dump()))
        self.session.flush()

    def categorias_de(self, producto_id: int) -> List[Tuple[Categoria, bool]]:
        consulta = (
            select(Categoria, ProductoCategoria.es_principal)
            .join(ProductoCategoria, col(Categoria.id) == ProductoCategoria.categoria_id)
            .where(ProductoCategoria.producto_id == producto_id)
            .order_by(col(ProductoCategoria.es_principal).desc(), Categoria.id)
        )
        return list(self.session.exec(consulta).all())

    def ingredientes_de(self, producto_id: int) -> List[Tuple[Ingrediente, ProductoIngrediente]]:
        consulta = (
            select(Ingrediente, ProductoIngrediente)
            .join(ProductoIngrediente, col(Ingrediente.id) == ProductoIngrediente.ingrediente_id)
            .where(ProductoIngrediente.producto_id == producto_id)
            .order_by(Ingrediente.id)
        )
        return list(self.session.exec(consulta).all())