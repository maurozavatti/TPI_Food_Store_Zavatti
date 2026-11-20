from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status

from app.core.deps import AdminUser
from app.modules.categorias.service import CategoriaNoEncontrada
from .schemas import ProductoCreate, ProductoRead, ProductosPaginados, ProductoStockUpdate, ProductoUpdate
from .service import ProductoNoEncontrado, ProductoService, get_producto_service

router = APIRouter(prefix="/productos", tags=["Productos"])

ServiceDep = Annotated[ProductoService, Depends(get_producto_service)]
IdPath = Annotated[int, Path(gt=0)]


@router.get("", response_model=ProductosPaginados)
def listar_productos(
    service: ServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[Optional[str], Query(max_length=100, description="Busca en el nombre (sin distinguir mayúsculas)")] = None,
    categoria_id: Annotated[Optional[int], Query(gt=0)] = None,
    disponible: Optional[bool] = None,
):
    """Público: solo productos activos, paginado."""
    return service.listar(skip, limit, search, categoria_id, disponible)


@router.get("/{id}", response_model=ProductoRead)
def obtener_producto(id: IdPath, service: ServiceDep):
    try:
        return service.obtener(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(datos: ProductoCreate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.crear(datos)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.put("/{id}", response_model=ProductoRead)
def actualizar_producto(id: IdPath, datos: ProductoUpdate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.actualizar(id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.patch("/{id}/stock", response_model=ProductoRead)
def actualizar_stock(id: IdPath, datos: ProductoStockUpdate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.actualizar_stock(id, datos)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(id: IdPath, _admin: AdminUser, service: ServiceDep):
    try:
        service.eliminar(id)
    except ProductoNoEncontrado as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)