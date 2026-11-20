from typing import List

from fastapi import HTTPException, status

from .schemas import UserPublic
from .unit_of_work import UsuarioUnitOfWork


class UsuarioService:
    """Gestión de usuarios (solo admin). En auth y usuarios se admite lanzar HTTPException
    directamente desde el Service, como en el proyecto de seguridad de la materia."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> List[UserPublic]:
        with self.uow as uow:
            return [UserPublic.model_validate(u) for u in uow.usuarios.listar()]

    def cambiar_estado(self, id: int, disabled: bool, admin: UserPublic) -> UserPublic:
        with self.uow as uow:
            usuario = uow.usuarios.get_by_id(id)
            if usuario is None:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            if disabled and usuario.id == admin.id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No podés desactivar tu propia cuenta")
            usuario.disabled = disabled  # idempotente: 200 aunque ya estuviera así
            return UserPublic.model_validate(uow.usuarios.add(usuario))


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())