from typing import TYPE_CHECKING, List, Optional

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "productos"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categorias.id", index=True)
    nombre: str = Field(max_length=150, index=True)
    descripcion: Optional[str] = Field(default=None)
    precio_base: float  # >= 0 (se valida en el schema)
    imagen_url: Optional[str] = Field(default=None)
    stock: int = Field(default=0)  # >= 0 (se valida en el schema y en el Service)
    disponible: bool = Field(default=True)
    activo: bool = Field(default=True)  # baja lógica

    # Categoria 1:N Producto
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    # Producto 1:N DetallePedido
    detalles: List["DetallePedido"] = Relationship(back_populates="producto")