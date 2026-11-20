from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import ARRAY, CheckConstraint, Column, DateTime, String, Text
from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import utc_now

if TYPE_CHECKING:
    from app.modules.categoria.models import Categoria
    from app.modules.ingrediente.models import Ingrediente


class ProductoCategoria(SQLModel, table=True):
    """Tabla intermedia N:M Producto <-> Categoría."""

    __tablename__ = "producto_categoria"

    producto_id: int = Field(foreign_key="productos.id", primary_key=True, ondelete="CASCADE")
    categoria_id: int = Field(foreign_key="categorias.id", primary_key=True, ondelete="CASCADE")
    es_principal: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))


class ProductoIngrediente(SQLModel, table=True):
    """Tabla intermedia N:M Producto <-> Ingrediente (con cantidad)."""

    __tablename__ = "producto_ingrediente"

    producto_id: int = Field(foreign_key="productos.id", primary_key=True, ondelete="CASCADE")
    ingrediente_id: int = Field(foreign_key="ingredientes.id", primary_key=True, ondelete="CASCADE")
    cantidad: Decimal = Field(max_digits=10, decimal_places=3)
    es_removible: bool = Field(default=True)
    created_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))


class Producto(SQLModel, table=True):
    __tablename__ = "productos"
    __table_args__ = (CheckConstraint("precio_base >= 0", name="ck_productos_precio_base"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=150, index=True)
    descripcion: str = Field(default="", sa_type=Text)
    precio_base: Decimal = Field(max_digits=10, decimal_places=2)
    imagenes_url: List[str] = Field(
        default_factory=list, sa_column=Column(ARRAY(String), nullable=False, server_default="{}")
    )
    disponible: bool = Field(default=True)

    # Auditoría
    created_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))
    deleted_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))

    categorias: List["Categoria"] = Relationship(back_populates="productos", link_model=ProductoCategoria)
    ingredientes: List["Ingrediente"] = Relationship(back_populates="productos", link_model=ProductoIngrediente)