from typing import Optional

from sqlmodel import Field, SQLModel


class UnidadMedida(SQLModel, table=True):
    """Tabla catálogo: solo lectura, se carga desde seed.py."""

    __tablename__ = "unidades_medida"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=50, unique=True)
    simbolo: str = Field(max_length=10, unique=True)
    tipo: str = Field(max_length=20)