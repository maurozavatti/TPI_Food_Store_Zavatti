from typing import List

from sqlmodel import SQLModel


class UnidadMedidaRead(SQLModel):
    id: int
    nombre: str
    simbolo: str
    tipo: str


class UnidadMedidaListResponse(SQLModel):
    total: int
    items: List[UnidadMedidaRead]