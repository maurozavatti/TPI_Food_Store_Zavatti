"""Dependencias de seguridad reutilizables.

Cadena:  oauth2_scheme → get_current_user → get_current_active_user → require_role
           (cookie)        (JWT válido, 401)   (cuenta activa, 400)    (rol, 403)
"""
from typing import Annotated, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.core.unit_of_work import UowDep
from app.modules.usuarios.schemas import Rol, UserPublic

COOKIE_NAME = "access_token"


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Igual que OAuth2PasswordBearer, pero lee el token de la cookie HttpOnly
    (el encabezado Authorization NO se acepta)."""

    async def __call__(self, request: Request) -> Optional[str]:
        token = request.cookies.get(COOKIE_NAME)
        if not token:
            if self.auto_error:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="No autenticado",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            return None
        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


async def get_current_user(token: Annotated[str, Depends(oauth2_scheme)], uow: UowDep) -> UserPublic:
    """RN-10: valida el JWT en cada petición y busca al usuario en la base."""
    credenciales_invalidas = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o token expirado",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None or payload.get("sub") is None:
        raise credenciales_invalidas

    with uow:
        usuario = uow.usuarios.get_by_username(payload["sub"])
        if usuario is None:
            raise credenciales_invalidas
        return UserPublic.model_validate(usuario)


async def get_current_active_user(
    current_user: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:
    """El token puede seguir vigente aunque un admin haya desactivado la cuenta."""
    if current_user.disabled:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
    return current_user


def require_role(allowed_roles: list[Rol]):
    """Fábrica de dependencias: devuelve una dependencia que exige uno de los roles (403 si no)."""

    async def role_checker(
        current_user: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permisos insuficientes. Rol actual: '{current_user.role}'. Se requiere: {allowed_roles}",
            )
        return current_user

    return role_checker


# ---------- Atajos para usar en los routers ----------
CurrentUser = Annotated[UserPublic, Depends(get_current_active_user)]  # cualquier usuario logueado
AdminUser = Annotated[UserPublic, Depends(require_role(["admin"]))]  # solo admin

SoloAutenticado = Depends(get_current_active_user)  # para dependencies=[...] de un router
SoloAdmin = Depends(require_role(["admin"]))  # para dependencies=[...] de un endpoint