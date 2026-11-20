from fastapi import HTTPException, status

from app.core.security import create_access_token, hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


class AuthService:
    """Registro y login. Usa el modelo Usuario (no tiene modelo propio)."""

    def __init__(self, uow: UsuarioUnitOfWork) -> None:
        self.uow = uow

    def registrar(self, data: UserCreate) -> UserPublic:
        with self.uow as uow:
            if uow.usuarios.get_by_username(data.username):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El nombre de usuario ya está registrado")
            if uow.usuarios.get_by_email(data.email):
                raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="El email ya está registrado")
            usuario = Usuario(
                username=data.username,
                full_name=data.full_name,
                email=data.email.lower(),
                hashed_password=hash_password(data.password),  # nunca en texto plano
                role="user",  # el registro público SIEMPRE crea un "user"
            )
            return UserPublic.model_validate(uow.usuarios.add(usuario))

    def autenticar(self, username: str, password: str) -> str:
        """Valida las credenciales y devuelve el JWT (que el router pone en la cookie)."""
        with self.uow as uow:
            usuario = uow.usuarios.get_by_username(username)
            # Mismo mensaje si no existe o si la contraseña está mal: no revela cuál falló
            if not verify_password(password, usuario.hashed_password if usuario else None):
                raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales incorrectas")
            assert usuario is not None
            if usuario.disabled:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cuenta de usuario desactivada")
            return create_access_token({"sub": usuario.username, "role": usuario.role})


def get_auth_service() -> AuthService:
    return AuthService(UsuarioUnitOfWork())