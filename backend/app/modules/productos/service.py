from typing import Optional

from app.modules.categorias.service import CategoriaNoEncontrada
from .models import Producto
from .schemas import ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate, ProductoUpdate
from .unit_of_work import ProductoUnitOfWork


# ---------- Excepciones de dominio ----------
class ProductoNoEncontrado(Exception):
    """→ 404"""


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork) -> None:
        self.uow = uow

    def listar(
        self, skip: int, limit: int, search: Optional[str], categoria_id: Optional[int], disponible: Optional[bool]
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def obtener(self, id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._buscar_activo(uow, id))

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, datos.categoria_id)
            producto = Producto(**datos.model_dump())
            return ProductoRead.model_validate(uow.productos.add(producto))

    def actualizar(self, id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, id)
            # exclude_none: un campo enviado como null no se aplica (no se puede dejar el nombre vacío)
            cambios = datos.model_dump(exclude_unset=True, exclude_none=True)
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            producto.sqlmodel_update(cambios)
            return ProductoRead.model_validate(uow.productos.add(producto))

    def actualizar_stock(self, id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar_activo(uow, id)
            producto.stock = datos.stock
            producto.disponible = datos.disponible
            return ProductoRead.model_validate(uow.productos.add(producto))

    def eliminar(self, id: int) -> None:
        """Baja lógica: activo = False."""
        with self.uow as uow:
            producto = self._buscar_activo(uow, id)
            producto.activo = False
            uow.productos.add(producto)

    # ---------- Auxiliares ----------
    @staticmethod
    def _buscar_activo(uow: ProductoUnitOfWork, id: int) -> Producto:
        producto = uow.productos.get_by_id(id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    @staticmethod
    def _validar_categoria(uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("La categoría no existe o está dada de baja")


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())