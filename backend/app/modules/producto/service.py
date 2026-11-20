from typing import List, Optional

from app.core.exceptions import BusinessRuleError, NotFoundError
from app.core.unit_of_work import UnitOfWork
from .models import Producto
from .schemas import (
    CategoriaBasicRead,
    IngredienteEnProducto,
    ProductoCategoriaRead,
    ProductoCreate,
    ProductoIngredienteRead,
    ProductoPaginatedResponse,
    ProductoRead,
    ProductoUpdate,
)


# ---------- Helpers ----------
def _obtener_o_404(uow: UnitOfWork, id: int) -> Producto:
    producto = uow.productos.get_activo(id)
    if not producto:
        raise NotFoundError("Producto no encontrado")  # RN-09
    return producto


def _validar_categorias(uow: UnitOfWork, ids: List[int]) -> None:
    for cat_id in set(ids):
        if not uow.categorias.get_activo(cat_id):
            raise NotFoundError(f"Categoría {cat_id} no encontrada")


def _validar_ingredientes(uow: UnitOfWork, ingredientes: List[IngredienteEnProducto]) -> None:
    vistos = set()
    for item in ingredientes:
        if item.ingrediente_id in vistos:
            raise BusinessRuleError(f"Ingrediente {item.ingrediente_id} repetido")
        vistos.add(item.ingrediente_id)
        if not uow.ingredientes.get_activo(item.ingrediente_id):
            raise NotFoundError(f"Ingrediente {item.ingrediente_id} no encontrado")


def _ingredientes_read(uow: UnitOfWork, producto_id: int) -> List[ProductoIngredienteRead]:
    return [
        ProductoIngredienteRead(
            id=ing.id,
            nombre=ing.nombre,
            es_alergeno=ing.es_alergeno,
            unidad_medida_id=ing.unidad_medida_id,
            cantidad=link.cantidad,
            es_removible=link.es_removible,
        )
        for ing, link in uow.productos.ingredientes_de(producto_id)
    ]


def _to_read(uow: UnitOfWork, producto: Producto) -> ProductoRead:
    """Arma la respuesta con sus categorías e ingredientes."""
    categorias = [CategoriaBasicRead(id=c.id, nombre=c.nombre) for c, _ in uow.productos.categorias_de(producto.id)]
    return ProductoRead.model_validate(
        producto, update={"categorias": categorias, "ingredientes": _ingredientes_read(uow, producto.id)}
    )


# ---------- Casos de uso ----------
def listar(
    uow: UnitOfWork,
    offset: int,
    limit: int,
    nombre: Optional[str],
    incluir_inactivos: bool,
    categoria_id: Optional[int],
) -> ProductoPaginatedResponse:
    with uow:
        total, items = uow.productos.listar(offset, limit, nombre, incluir_inactivos, categoria_id)
        return ProductoPaginatedResponse(
            total=total, offset=offset, limit=limit, items=[_to_read(uow, p) for p in items]
        )


def obtener(uow: UnitOfWork, id: int) -> ProductoRead:
    with uow:
        return _to_read(uow, _obtener_o_404(uow, id))


def crear(uow: UnitOfWork, data: ProductoCreate) -> ProductoRead:
    with uow:
        # 1) validar TODO antes de escribir
        _validar_categorias(uow, data.categoria_ids)
        _validar_ingredientes(uow, data.ingredientes)
        # 2) escribir: producto + relaciones en la MISMA transacción
        producto = uow.productos.add(
            Producto.model_validate(data.model_dump(exclude={"categoria_ids", "ingredientes"}))
        )
        uow.productos.reemplazar_categorias(producto.id, data.categoria_ids)
        uow.productos.reemplazar_ingredientes(producto.id, data.ingredientes)
        return _to_read(uow, producto)
    # al salir del with: commit (o rollback si algo falló)


def actualizar(uow: UnitOfWork, id: int, data: ProductoUpdate) -> ProductoRead:
    with uow:
        producto = _obtener_o_404(uow, id)
        if data.categoria_ids is not None:
            _validar_categorias(uow, data.categoria_ids)
        if data.ingredientes is not None:
            _validar_ingredientes(uow, data.ingredientes)

        cambios = data.model_dump(exclude_unset=True, exclude={"categoria_ids", "ingredientes"})
        uow.productos.update(producto, cambios)
        if data.categoria_ids is not None:
            uow.productos.reemplazar_categorias(id, data.categoria_ids)
        if data.ingredientes is not None:
            uow.productos.reemplazar_ingredientes(id, data.ingredientes)
        return _to_read(uow, producto)


def eliminar(uow: UnitOfWork, id: int) -> None:
    with uow:
        uow.productos.soft_delete(_obtener_o_404(uow, id))


def listar_categorias(uow: UnitOfWork, id: int) -> List[ProductoCategoriaRead]:
    with uow:
        _obtener_o_404(uow, id)
        return [
            ProductoCategoriaRead(id=c.id, nombre=c.nombre, descripcion=c.descripcion, es_principal=principal)
            for c, principal in uow.productos.categorias_de(id)
        ]


def listar_ingredientes(uow: UnitOfWork, id: int) -> List[ProductoIngredienteRead]:
    with uow:
        _obtener_o_404(uow, id)
        return _ingredientes_read(uow, id)