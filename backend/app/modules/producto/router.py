from typing import List, Optional

from fastapi import APIRouter, Path, Query, status
from app.core.deps import SoloAdmin, SoloAutenticado

from app.core.unit_of_work import UowDep
from . import service
from .schemas import (
    ProductoCategoriaRead,
    ProductoCreate,
    ProductoIngredienteRead,
    ProductoPaginatedResponse,
    ProductoRead,
    ProductoUpdate,
)

router = APIRouter(prefix="/categorias", tags=["Productos"], dependencies=[SoloAutenticado])


@router.get("/", response_model=ProductoPaginatedResponse)
def listar_productos(
    uow: UowDep,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    nombre: Optional[str] = Query(None, description="Búsqueda parcial por nombre"),
    incluir_inactivos: bool = Query(False),
    categoria_id: Optional[int] = Query(None, gt=0, description="Filtrar por categoría"),
):
    return service.listar(uow, offset, limit, nombre, incluir_inactivos, categoria_id)


@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=[SoloAdmin])
def crear_producto(data: ProductoCreate, uow: UowDep):
    return service.crear(uow, data)


@router.get("/{id}", response_model=ProductoRead)
def detalle_producto(uow: UowDep, id: int = Path(..., gt=0)):
    return service.obtener(uow, id)


@router.put("/{id}", response_model=ProductoRead, dependencies=[SoloAdmin])
def actualizar_producto(data: ProductoUpdate, uow: UowDep, id: int = Path(..., gt=0)):
    return service.actualizar(uow, id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[SoloAdmin])
def eliminar_producto(uow: UowDep, id: int = Path(..., gt=0)):
    service.eliminar(uow, id)


@router.get("/{id}/categorias", response_model=List[ProductoCategoriaRead])
def categorias_del_producto(uow: UowDep, id: int = Path(..., gt=0)):
    return service.listar_categorias(uow, id)


@router.get("/{id}/ingredientes", response_model=List[ProductoIngredienteRead])
def ingredientes_del_producto(uow: UowDep, id: int = Path(..., gt=0)):
    return service.listar_ingredientes(uow, id)