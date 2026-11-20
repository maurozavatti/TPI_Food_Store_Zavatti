from typing import Annotated, List

from fastapi import APIRouter, Depends, HTTPException, Path, Response, status

from app.core.deps import AdminUser
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado, get_categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorías"])

ServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]
IdPath = Annotated[int, Path(gt=0)]


@router.get("", response_model=List[CategoriaRead])
def listar_categorias(service: ServiceDep):
    """Público: solo las activas."""
    return service.listar()


@router.get("/{id}", response_model=CategoriaRead)
def obtener_categoria(id: IdPath, service: ServiceDep):
    try:
        return service.obtener(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(datos: CategoriaCreate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.crear(datos)
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.put("/{id}", response_model=CategoriaRead)
def actualizar_categoria(id: IdPath, datos: CategoriaUpdate, _admin: AdminUser, service: ServiceDep):
    try:
        return service.actualizar(id, datos)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except NombreDuplicado as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(id: IdPath, _admin: AdminUser, service: ServiceDep):
    try:
        service.eliminar(id)
    except CategoriaNoEncontrada as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    return Response(status_code=status.HTTP_204_NO_CONTENT)