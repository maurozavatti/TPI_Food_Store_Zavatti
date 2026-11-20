from typing import List, Optional

from fastapi import APIRouter, Path, Query, status

from app.core.deps import AdminUser, CurrentUser, SoloAutenticado
from app.core.unit_of_work import UowDep
from . import service
from .schemas import (
    DetallePedidoCreate,
    DetallePedidoRead,
    EstadoPedidoRead,
    FormaPagoRead,
    HistorialEstadoRead,
    PedidoCreate,
    PedidoEstadoUpdate,
    PedidoPaginatedResponse,
    PedidoRead,
)

router = APIRouter(prefix="/pedido", tags=["Pedidos"])
catalogos_router = APIRouter(tags=["Catálogos de Ventas"], dependencies=[SoloAutenticado])


# ---------- Catálogos (solo lectura: RN-06) ----------
@catalogos_router.get("/estados-pedido/", response_model=List[EstadoPedidoRead])
def listar_estados(uow: UowDep):
    return service.listar_estados(uow)


@catalogos_router.get("/formas-pago/", response_model=List[FormaPagoRead])
def listar_formas_pago(uow: UowDep):
    return service.listar_formas_pago(uow)


# ---------- Pedido ----------
@router.get("/", response_model=PedidoPaginatedResponse)
def listar_pedidos(
    usuario: CurrentUser,
    uow: UowDep,
    offset: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    estado_codigo: Optional[str] = Query(None, description="Filtrar por estado"),
    incluir_inactivos: bool = Query(False),
):
    return service.listar(uow, offset, limit, estado_codigo, incluir_inactivos, usuario)


@router.post("/", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(data: PedidoCreate, usuario: CurrentUser, uow: UowDep):
    """RN-05: cualquier usuario autenticado (user o admin) puede crear pedidos."""
    return service.crear(uow, data, usuario)


@router.get("/{id}", response_model=PedidoRead)
def detalle_pedido(usuario: CurrentUser, uow: UowDep, id: int = Path(..., gt=0)):
    return service.obtener(uow, id, usuario)


@router.put("/{id}", response_model=PedidoRead)
def cambiar_estado_pedido(data: PedidoEstadoUpdate, admin: AdminUser, uow: UowDep, id: int = Path(..., gt=0)):
    """Cambiar el estado es una operación de gestión: solo admin."""
    return service.cambiar_estado(uow, id, data, admin)


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_pedido(admin: AdminUser, uow: UowDep, id: int = Path(..., gt=0)):
    service.eliminar(uow, id, admin)


@router.get("/{id}/historial", response_model=List[HistorialEstadoRead])
def historial_pedido(usuario: CurrentUser, uow: UowDep, id: int = Path(..., gt=0)):
    return service.historial(uow, id, usuario)


# ---------- DetallePedido (el dueño del pedido o un admin) ----------
@router.get("/{id}/detalles", response_model=List[DetallePedidoRead])
def listar_detalles(usuario: CurrentUser, uow: UowDep, id: int = Path(..., gt=0)):
    return service.listar_detalles(uow, id, usuario)


@router.post("/{id}/detalles", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def agregar_detalle(data: DetallePedidoCreate, usuario: CurrentUser, uow: UowDep, id: int = Path(..., gt=0)):
    return service.agregar_detalle(uow, id, data, usuario)


@router.delete("/{id}/detalles/{producto_id}", response_model=PedidoRead)
def quitar_detalle(
    usuario: CurrentUser, uow: UowDep, id: int = Path(..., gt=0), producto_id: int = Path(..., gt=0)
):
    return service.quitar_detalle(uow, id, producto_id, usuario)
