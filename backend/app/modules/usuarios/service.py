from typing import List

from app.core.exceptions import BadRequestError, ConflictError, NotFoundError, UnauthorizedError
from app.core.security import create_access_token, hash_password, verify_password
from app.core.unit_of_work import UnitOfWork
from .models import Usuario
from .schemas import UserCreate, UserPublic

CUENTA_DESACTIVADA = "Cuenta de usuario desactivada"


def registrar(uow: UnitOfWork, data: UserCreate) -> UserPublic:
    with uow:
        # RN-02: username y email únicos (sin distinguir mayúsculas)
        if uow.usuarios.get_by_username(data.username):
            raise ConflictError("El nombre de usuario ya está registrado")
        if uow.usuarios.get_by_email(data.email):
            raise ConflictError("El email ya está registrado")

        usuario = Usuario(
            username=data.username,
            full_name=data.full_name,
            email=data.email.lower(),
            hashed_password=hash_password(data.password),  # RN-01: nunca en texto plano
            role="user",  # RN-08: el registro público SIEMPRE crea un "user"
        )
        return UserPublic.model_validate(uow.usuarios.add(usuario))


def autenticar(uow: UnitOfWork, username: str, password: str) -> str:
    """Valida las credenciales y devuelve el JWT."""
    with uow:
        usuario = uow.usuarios.get_by_username(username)
        # Mismo mensaje si no existe o si la contraseña está mal: no revela cuál falló
        if not verify_password(password, usuario.hashed_password if usuario else None):
            raise UnauthorizedError("Credenciales incorrectas")
        if usuario.disabled:
            raise BadRequestError(CUENTA_DESACTIVADA)
        return create_access_token({"sub": usuario.username, "role": usuario.role})


def listar(uow: UnitOfWork) -> List[UserPublic]:
    with uow:
        return [UserPublic.model_validate(u) for u in uow.usuarios.listar()]


def cambiar_estado(uow: UnitOfWork, id: int, disabled: bool, admin: UserPublic) -> UserPublic:
    with uow:
        usuario = uow.usuarios.get(id)
        if not usuario:
            raise NotFoundError("Usuario no encontrado")
        if disabled and usuario.id == admin.id:
            raise ConflictError("No podés desactivar tu propia cuenta")
        return UserPublic.model_validate(uow.usuarios.update(usuario, {"disabled": disabled}))
    