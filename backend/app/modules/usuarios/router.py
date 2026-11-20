from typing import Annotated, List

from fastapi import APIRouter, Depends, Path

from app.core.deps import AdminUser
from .schemas import UserPublic
from .service import UsuarioService, get_usuario_service

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios (admin)"])

ServiceDep = Annotated[UsuarioService, Depends(get_usuario_service)]


@router.get("", response_model=List[UserPublic])
def listar_usuarios(_admin: AdminUser, service: ServiceDep):
    return service.listar()


@router.post("/{id}/activar", response_model=UserPublic)
def activar_usuario(admin: AdminUser, service: ServiceDep, id: int = Path(gt=0)):
    return service.cambiar_estado(id, disabled=False, admin=admin)


@router.post("/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(admin: AdminUser, service: ServiceDep, id: int = Path(gt=0)):
    return service.cambiar_estado(id, disabled=True, admin=admin)