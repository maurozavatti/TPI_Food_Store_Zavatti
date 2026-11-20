from typing import Optional

from app.core.exceptions import ConflictError, NotFoundError
from app.core.unit_of_work import UnitOfWork
from .models import Ingrediente
from .schemas import IngredienteCreate, IngredientePaginatedResponse, IngredienteRead, IngredienteUpdate


def _obtener_o_404(uow: UnitOfWork, id: int) -> Ingrediente:
    ingrediente = uow.ingredientes.get_activo(id)
    if not ingrediente:
        raise NotFoundError("Ingrediente no encontrado")  # RN-11
    return ingrediente


def _validar_nombre_unico(uow: UnitOfWork, nombre: str, excluir_id: Optional[int] = None) -> None:
    existente = uow.ingredientes.buscar_por_nombre_activo(nombre)
    if existente and existente.id != excluir_id:
        raise ConflictError(f"Ya existe un ingrediente con el nombre '{nombre}'")  # RN-10


def _validar_unidad(uow: UnitOfWork, unidad_id: int) -> None:
    if not uow.unidades_medida.get(unidad_id):
        raise NotFoundError(f"Unidad de medida {unidad_id} no encontrada")


def listar(
    uow: UnitOfWork, offset: int, limit: int, nombre: Optional[str], incluir_inactivos: bool
) -> IngredientePaginatedResponse:
    with uow:
        total, items = uow.ingredientes.listar(offset, limit, nombre, incluir_inactivos)
        return IngredientePaginatedResponse(
            total=total, offset=offset, limit=limit, items=[IngredienteRead.model_validate(i) for i in items]
        )


def obtener(uow: UnitOfWork, id: int) -> IngredienteRead:
    with uow:
        return IngredienteRead.model_validate(_obtener_o_404(uow, id))


def crear(uow: UnitOfWork, data: IngredienteCreate) -> IngredienteRead:
    with uow:
        _validar_nombre_unico(uow, data.nombre)
        _validar_unidad(uow, data.unidad_medida_id)
        ingrediente = uow.ingredientes.add(Ingrediente.model_validate(data))
        return IngredienteRead.model_validate(ingrediente)


def actualizar(uow: UnitOfWork, id: int, data: IngredienteUpdate) -> IngredienteRead:
    with uow:
        ingrediente = _obtener_o_404(uow, id)
        cambios = data.model_dump(exclude_unset=True)
        if "nombre" in cambios:
            _validar_nombre_unico(uow, cambios["nombre"], excluir_id=id)
        if "unidad_medida_id" in cambios:
            _validar_unidad(uow, cambios["unidad_medida_id"])
        return IngredienteRead.model_validate(uow.ingredientes.update(ingrediente, cambios))


def eliminar(uow: UnitOfWork, id: int) -> None:
    with uow:
        uow.ingredientes.soft_delete(_obtener_o_404(uow, id))