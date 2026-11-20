from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import COOKIE_NAME, CurrentUser
from app.modules.usuarios.schemas import UserCreate, UserPublic
from .schemas import MensajeResponse
from .service import AuthService, get_auth_service

router = APIRouter(prefix="/auth", tags=["Autenticación"])

ServiceDep = Annotated[AuthService, Depends(get_auth_service)]


@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(data: UserCreate, service: ServiceDep):
    """Registro público: siempre crea un usuario con rol 'user'. 409 si el username o el email ya existen."""
    return service.registrar(data)


@router.post("/token", response_model=MensajeResponse)
def login(form_data: Annotated[OAuth2PasswordRequestForm, Depends()], service: ServiceDep, response: Response):
    """Login OAuth2 (formulario). El JWT viaja en la cookie HttpOnly, NO en el cuerpo."""
    token = service.autenticar(form_data.username, form_data.password)
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,  # JavaScript no la puede leer
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=settings.COOKIE_SECURE,
    )
    return MensajeResponse(message="Login exitoso")


@router.post("/logout", response_model=MensajeResponse)
def logout(response: Response):
    """Borra la cookie en el navegador."""
    response.delete_cookie(key=COOKIE_NAME, httponly=True, samesite="lax", secure=settings.COOKIE_SECURE)
    return MensajeResponse(message="Sesión cerrada")


@router.get("/me", response_model=UserPublic)
def me(current_user: CurrentUser):
    return current_user