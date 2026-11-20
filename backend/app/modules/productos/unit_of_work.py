from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository
from .repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    """Expone productos y categorías (para validar categoria_id) sobre la misma sesión."""

    productos: ProductoRepository
    categorias: CategoriaRepository

    def _crear_repositorios(self) -> None:
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)