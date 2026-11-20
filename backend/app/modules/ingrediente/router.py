from typing import Optional

from fastapi import APIRouter, Path, Query, status
from app.core.deps import SoloAdmin, SoloAutenticado

from app.core.unit_of_work import UowDep
from . import service
from .schemas import IngredienteCreate, IngredientePaginatedResponse, IngredienteRead, IngredienteUpdate

router = APIRouter(prefix="/categorias", tags=["Ingredientes"], dependencies=[SoloAutenticado])


@router.get("/", response_model=IngredientePaginatedResponse)
def listar_ingredientes(
    uow: UowDep,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    nombre: Optional[str] = Query(None),
    incluir_inactivos: bool = Query(False),
):
    return service.listar(uow, offset, limit, nombre, incluir_inactivos)


@router.post("/", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED, dependencies=[SoloAdmin])
def crear_ingrediente(data: IngredienteCreate, uow: UowDep):
    return service.crear(uow, data)


@router.get("/{id}", response_model=IngredienteRead)
def detalle_ingrediente(uow: UowDep, id: int = Path(..., gt=0)):
    return service.obtener(uow, id)


@router.put("/{id}", response_model=IngredienteRead, dependencies=[SoloAdmin])
def actualizar_ingrediente(data: IngredienteUpdate, uow: UowDep, id: int = Path(..., gt=0)):
    return service.actualizar(uow, id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[SoloAdmin])
def eliminar_ingrediente(uow: UowDep, id: int = Path(..., gt=0)):
    service.eliminar(uow, id)