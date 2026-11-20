from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import utc_now

if TYPE_CHECKING:  # solo para el editor: evita el import circular en tiempo de ejecución
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    __tablename__ = "usuarios"

    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(max_length=50, unique=True, index=True)
    full_name: str = Field(max_length=100)
    email: str = Field(max_length=254, unique=True, index=True)
    hashed_password: str = Field(max_length=255)  # hash bcrypt, NUNCA la contraseña
    role: str = Field(default="user", max_length=20)  # "user" o "admin"
    disabled: bool = Field(default=False)  # baja lógica
    created_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))

    # Usuario 1:N Pedido
    pedidos: List["Pedido"] = Relationship(back_populates="usuario")