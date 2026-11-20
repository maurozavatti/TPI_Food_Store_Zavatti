from datetime import datetime
from typing import List, Optional

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


class IngredienteBase(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: str = Field(min_length=1, max_length=100, schema_extra={"examples": ["Harina"]})
    descripcion: str = Field(default="")
    es_alergeno: bool = Field(default=False)
    unidad_medida_id: int = Field(gt=0, schema_extra={"examples": [2]})


class IngredienteCreate(IngredienteBase):
    pass


class IngredienteUpdate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    nombre: Optional[str] = Field(default=None, min_length=1, max_length=100)
    descripcion: Optional[str] = None
    es_alergeno: Optional[bool] = None
    unidad_medida_id: Optional[int] = Field(default=None, gt=0)


class IngredienteRead(IngredienteBase):
    id: int
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None


class IngredientePaginatedResponse(SQLModel):
    total: int
    offset: int
    limit: int
    items: List[IngredienteRead]