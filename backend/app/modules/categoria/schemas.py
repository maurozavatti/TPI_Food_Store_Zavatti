from datetime import datetime
from typing import List, Optional

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


class CategoriaBase(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=1, max_length=100, schema_extra={"examples": ["Electrónica"]})
    descripcion: str = Field(default="", schema_extra={"examples": ["Dispositivos y accesorios"]})  # RN-03


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: Optional[str] = Field(default=None, min_length=1, max_length=100)
    descripcion: Optional[str] = None


class CategoriaRead(CategoriaBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class CategoriaPaginatedResponse(SQLModel):
    total: int
    offset: int
    limit: int
    items: List[CategoriaRead]


# Schema reducido de Producto (evita importar producto/schema.py: dependencia circular)
class ProductoBasicRead(SQLModel):
    id: int
    nombre: str
    precio_base: float
    disponible: bool