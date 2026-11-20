from typing import List, Optional

from fastapi import APIRouter, Path, Query, status

from app.core.deps import SoloAdmin, SoloAutenticado

from app.core.unit_of_work import UowDep
from . import service
from .schemas import (
    CategoriaCreate,
    CategoriaPaginatedResponse,
    CategoriaRead,
    CategoriaUpdate,
    ProductoBasicRead,
)

router = APIRouter(prefix="/categorias", tags=["Categorías"], dependencies=[SoloAutenticado])


@router.get("/", response_model=CategoriaPaginatedResponse)
def listar_categorias(
    uow: UowDep,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    nombre: Optional[str] = Query(None, description="Búsqueda parcial por nombre"),
    incluir_inactivos: bool = Query(False, description="Incluir categorías eliminadas"),
):
    return service.listar(uow, offset, limit, nombre, incluir_inactivos)


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED, dependencies=[SoloAdmin])
def crear_categoria(data: CategoriaCreate, uow: UowDep):
    return service.crear(uow, data)


@router.get("/{id}", response_model=CategoriaRead)
def detalle_categoria(uow: UowDep, id: int = Path(..., gt=0)):
    return service.obtener(uow, id)


@router.put("/{id}", response_model=CategoriaRead, dependencies=[SoloAdmin])
def actualizar_categoria(data: CategoriaUpdate, uow: UowDep, id: int = Path(..., gt=0)):
    return service.actualizar(uow, id, data)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[SoloAdmin])
def eliminar_categoria(uow: UowDep, id: int = Path(..., gt=0)):
    service.eliminar(uow, id)


@router.get("/{id}/productos", response_model=List[ProductoBasicRead])
def productos_de_categoria(uow: UowDep, id: int = Path(..., gt=0)):
    return service.listar_productos(uow, id)