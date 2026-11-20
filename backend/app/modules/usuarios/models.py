from datetime import datetime
from typing import Optional

from sqlalchemy import CheckConstraint, DateTime
from sqlmodel import Field, SQLModel

from app.core.utils import utc_now


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"
    __table_args__ = (CheckConstraint("role IN ('user', 'admin')", name="ck_usuarios_role"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=100)
    email: str = Field(max_length=254, unique=True, index=True)
    hashed_password: str = Field(max_length=255)  # hash bcrypt, NUNCA la contraseña
    role: str = Field(default="user", max_length=20)
    disabled: bool = Field(default=False)  # borrado lógico del usuario

    # Auditoría
    created_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))