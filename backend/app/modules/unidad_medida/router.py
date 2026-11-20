from fastapi import APIRouter, Path

from app.core.deps import SoloAutenticado

from app.core.unit_of_work import UowDep
from . import service
from .schemas import UnidadMedidaListResponse, UnidadMedidaRead

router = APIRouter(prefix="/unidades-medida", tags=["Unidades de Medida"], dependencies=[SoloAutenticado])


@router.get("/", response_model=UnidadMedidaListResponse)
def listar_unidades(uow: UowDep):
    return service.listar(uow)


@router.get("/{id}", response_model=UnidadMedidaRead)
def detalle_unidad(uow: UowDep, id: int = Path(..., gt=0)):
    return service.obtener(uow, id)