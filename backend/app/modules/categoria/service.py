from typing import List, Optional

from app.core.exceptions import ConflictError, NotFoundError
from app.core.unit_of_work import UnitOfWork
from .models import Categoria
from .schemas import (
    CategoriaCreate,
    CategoriaPaginatedResponse,
    CategoriaRead,
    CategoriaUpdate,
    ProductoBasicRead,
)


# ---------- Reglas de negocio ----------
def _obtener_o_404(uow: UnitOfWork, id: int) -> Categoria:
    categoria = uow.categorias.get_activo(id)
    if not categoria:
        raise NotFoundError("Categoría no encontrada")  # RN-04
    return categoria


def _validar_nombre_unico(uow: UnitOfWork, nombre: str, excluir_id: Optional[int] = None) -> None:
    existente = uow.categorias.buscar_por_nombre_activo(nombre)
    if existente and existente.id != excluir_id:
        raise ConflictError(f"Ya existe una categoría con el nombre '{nombre}'")  # RN-02


# ---------- Casos de uso ----------
def listar(
    uow: UnitOfWork, offset: int, limit: int, nombre: Optional[str], incluir_inactivos: bool
) -> CategoriaPaginatedResponse:
    with uow:
        total, items = uow.categorias.listar(offset, limit, nombre, incluir_inactivos)
        return CategoriaPaginatedResponse(
            total=total, offset=offset, limit=limit, items=[CategoriaRead.model_validate(c) for c in items]
        )


def obtener(uow: UnitOfWork, id: int) -> CategoriaRead:
    with uow:
        return CategoriaRead.model_validate(_obtener_o_404(uow, id))


def crear(uow: UnitOfWork, data: CategoriaCreate) -> CategoriaRead:
    with uow:
        _validar_nombre_unico(uow, data.nombre)
        categoria = uow.categorias.add(Categoria.model_validate(data))
        return CategoriaRead.model_validate(categoria)


def actualizar(uow: UnitOfWork, id: int, data: CategoriaUpdate) -> CategoriaRead:
    with uow:
        categoria = _obtener_o_404(uow, id)
        cambios = data.model_dump(exclude_unset=True)
        if "nombre" in cambios:
            _validar_nombre_unico(uow, cambios["nombre"], excluir_id=id)
        return CategoriaRead.model_validate(uow.categorias.update(categoria, cambios))


def eliminar(uow: UnitOfWork, id: int) -> None:
    with uow:
        categoria = _obtener_o_404(uow, id)
        cantidad = uow.categorias.contar_productos_activos(id)
        if cantidad > 0:  # RN-05
            raise ConflictError(f"La categoría tiene {cantidad} producto(s) asociado(s) y no puede eliminarse")
        uow.categorias.soft_delete(categoria)


def listar_productos(uow: UnitOfWork, id: int) -> List[ProductoBasicRead]:
    with uow:
        _obtener_o_404(uow, id)
        return [ProductoBasicRead.model_validate(p) for p in uow.categorias.productos_activos(id)]