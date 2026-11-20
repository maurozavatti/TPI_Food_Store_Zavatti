from datetime import datetime
from typing import List, Optional

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


class IngredienteEnProducto(SQLModel):
    """Lo que el cliente manda para asociar un ingrediente al producto."""

    ingrediente_id: int = Field(gt=0)
    cantidad: float = Field(gt=0, schema_extra={"examples": [200]})
    es_removible: bool = True


class ProductoBase(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=1, max_length=150, schema_extra={"examples": ["Pizza muzzarella"]})  # RN-06
    descripcion: str = Field(default="")
    precio_base: float = Field(ge=0, schema_extra={"examples": [8500]})  # RN-07
    imagenes_url: List[str] = Field(default_factory=list)
    disponible: bool = True  # RN-08


class ProductoCreate(ProductoBase):
    categoria_ids: List[int] = Field(min_length=1, schema_extra={"examples": [[1]]})
    ingredientes: List[IngredienteEnProducto] = Field(default_factory=list)


class ProductoUpdate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: Optional[str] = Field(default=None, min_length=1, max_length=150)
    descripcion: Optional[str] = None
    precio_base: Optional[float] = Field(default=None, ge=0)
    imagenes_url: Optional[List[str]] = None
    disponible: Optional[bool] = None
    categoria_ids: Optional[List[int]] = Field(default=None, min_length=1)
    ingredientes: Optional[List[IngredienteEnProducto]] = None


class CategoriaBasicRead(SQLModel):
    id: int
    nombre: str


class ProductoCategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: str
    es_principal: bool


class ProductoIngredienteRead(SQLModel):
    id: int
    nombre: str
    es_alergeno: bool
    unidad_medida_id: int
    cantidad: float
    es_removible: bool


class ProductoRead(ProductoBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    categorias: List[CategoriaBasicRead] = []
    ingredientes: List[ProductoIngredienteRead] = []


class ProductoPaginatedResponse(SQLModel):
    total: int
    offset: int
    limit: int
    items: List[ProductoRead]