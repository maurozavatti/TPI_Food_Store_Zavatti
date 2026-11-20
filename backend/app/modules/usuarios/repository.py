from typing import List, Optional

from sqlmodel import func, select

from app.core.repository import BaseRepository
from .models import Usuario


class UsuarioRepository(BaseRepository[Usuario]):
    model = Usuario

    def get_by_username(self, username: str) -> Optional[Usuario]:
        consulta = select(Usuario).where(func.lower(Usuario.username) == username.strip().lower())
        return self.session.exec(consulta).first()

    def get_by_email(self, email: str) -> Optional[Usuario]:
        consulta = select(Usuario).where(func.lower(Usuario.email) == email.strip().lower())
        return self.session.exec(consulta).first()

    def listar(self) -> List[Usuario]:
        return list(self.session.exec(select(Usuario).order_by(Usuario.id)).all())