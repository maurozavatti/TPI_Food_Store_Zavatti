from typing import Annotated, List

from fastapi import APIRouter, Depends, Path, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, AdminUser, CurrentUser
from app.core.unit_of_work import UowDep
from . import service
from .schemas import MensajeResponse, UserCreate, UserPublic

router = APIRouter(prefix="/auth", tags=["Autenticación"])


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, uow: UowDep):
    """Registro público (no requiere sesión). Siempre crea un usuario con rol 'user'."""
    return service.registrar(uow, data)


@router.post("/token", response_model=MensajeResponse)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], uow: UowDep, response: Response):
    """Login OAuth2: recibe username y password como FORMULARIO y entrega el JWT en una cookie HttpOnly."""
    token = service.autenticar(uow, form_data.username, form_data.password)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,  # JavaScript no la puede leer → un XSS no roba el token
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",  # mitiga CSRF
        secure=settings.COOKIE_SECURE,  # en producción con HTTPS: True
    )
    return MensajeResponse(mensaje="Login exitoso. Sesión iniciada.")


@router.post("/logout", response_model=MensajeResponse)
def logout(response: Response):
    """Responde con un Set-Cookie que borra la cookie en el navegador."""
    response.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="lax", secure=settings.COOKIE_SECURE)
    return MensajeResponse(mensaje="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUser):
    return current_user


# ---------- Administración de usuarios (solo admin) ----------
@router.get("/admin/usuarios", response_model=List[UserPublic])
def listar_usuarios(_admin: AdminUser, uow: UowDep):
    return service.listar(uow)


@router.post("/admin/usuarios/{id}/activar", response_model=UserPublic)
def activar_usuario(admin: AdminUser, uow: UowDep, id: int = Path(..., gt=0)):
    return service.cambiar_estado(uow, id, disabled=False, admin=admin)


@router.post("/admin/usuarios/{id}/desactivar", response_model=UserPublic)
def desactivar_usuario(admin: AdminUser, uow: UowDep, id: int = Path(..., gt=0)):
    return service.cambiar_estado(uow, id, disabled=True, admin=admin)