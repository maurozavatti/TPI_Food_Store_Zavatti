from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import DateTime, Text
from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import utc_now
from app.modules.producto.models import ProductoCategoria

if TYPE_CHECKING:
    from app.modules.producto.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categorias"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100, index=True)
    descripcion: str = Field(default="", sa_type=Text)

    # Auditoría
    created_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))
    deleted_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))

    productos: List["Producto"] = Relationship(back_populates="categorias", link_model=ProductoCategoria)