from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status

from app.core.deps import AdminUser, CurrentUser
from .schemas import CambioEstado, EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoEncontrado,
    ReglaDeNegocio,
    get_pedido_service,
)

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])

ServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]
IdPath = Annotated[int, Path(gt=0)]


def _a_http(e: Exception) -> HTTPException:
    """Traduce una excepción de dominio al código HTTP de la especificación."""
    if isinstance(e, (PedidoNoEncontrado, ProductoNoEncontrado)):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    if isinstance(e, PedidoAjeno):
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))  # ReglaDeNegocio


ERRORES = (PedidoNoEncontrado, ProductoNoEncontrado, PedidoAjeno, ReglaDeNegocio)


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def crear_pedido(datos: PedidoCreate, usuario: CurrentUser, service: ServiceDep):
    """RN-01: crea el pedido desde el carrito, descontando stock en una sola transacción."""
    try:
        return service.crear(usuario, datos)
    except ERRORES as e:
        raise _a_http(e)


@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: CurrentUser,
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: Optional[EstadoPedido] = None,
):
    """Propios (user) o todos (admin)."""
    return service.listar(usuario, skip, limit, estado)


@router.get("/resumen", response_model=ResumenPedidos)
def resumen_pedidos(_admin: AdminUser, service: ServiceDep):
    """Indicadores del panel. Declarado ANTES de /{id} para que 'resumen' no se tome como id."""
    return service.resumen()


@router.get("/{id}", response_model=PedidoRead)
def obtener_pedido(id: IdPath, usuario: CurrentUser, service: ServiceDep):
    try:
        return service.obtener(usuario, id)
    except ERRORES as e:
        raise _a_http(e)


@router.patch("/{id}/estado", response_model=PedidoRead)
def cambiar_estado(id: IdPath, datos: CambioEstado, _admin: AdminUser, service: ServiceDep):
    """RN-02 y RN-03: avanza o cancela según la máquina de estados."""
    try:
        return service.cambiar_estado(id, datos)
    except ERRORES as e:
        raise _a_http(e)


@router.patch("/{id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(id: IdPath, usuario: CurrentUser, service: ServiceDep):
    """RN-03 y RN-04: el dueño cancela su pedido mientras está PENDIENTE."""
    try:
        return service.cancelar(usuario, id)
    except ERRORES as e:
        raise _a_http(e)