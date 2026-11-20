from datetime import datetime
from typing import Any, List, Optional

from pydantic import ConfigDict
from sqlmodel import Field, SQLModel


# ---------- Catálogos ----------
class EstadoPedidoRead(SQLModel):
    codigo: str
    descripcion: str
    orden: int
    es_terminal: bool


class FormaPagoRead(SQLModel):
    codigo: str
    descripcion: str
    activo: bool


# ---------- Entrada ----------
class DetallePedidoCreate(SQLModel):
    producto_id: int = Field(gt=0, schema_extra={"examples": [1]})
    cantidad: int = Field(ge=1, le=999, schema_extra={"examples": [2]})
    personalizacion: Optional[dict[str, Any]] = Field(
        default=None, schema_extra={"examples": [{"sin": ["cebolla"]}]}
    )


class PedidoCreate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    forma_pago_codigo: str = Field(min_length=1, max_length=30, schema_extra={"examples": ["EFECTIVO"]})
    # usuario_id NO viene del cliente: se toma del usuario logueado (cookie)
    direccion_id: Optional[int] = Field(default=None, gt=0)
    descuento: float = Field(default=0, ge=0)
    costo_envio: float = Field(default=0, ge=0)
    notas: Optional[str] = None
    detalles: List[DetallePedidoCreate] = Field(min_length=1)  # RN-12


class PedidoEstadoUpdate(SQLModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    estado_codigo: str = Field(min_length=1, max_length=20, schema_extra={"examples": ["CONFIRMADO"]})
    motivo: Optional[str] = None
    


# ---------- Salida ----------
class DetallePedidoRead(SQLModel):
    producto_id: int
    cantidad: int
    nombre_producto_snap: str
    precio_unitario_snap: float
    subtotal_snap: float
    personalizacion: Optional[dict[str, Any]] = None
    created_at: datetime


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    direccion_id: Optional[int]
    estado_codigo: str
    forma_pago_codigo: str
    subtotal: float
    descuento: float
    costo_envio: float
    total: float
    notas: Optional[str]
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    detalles: List[DetallePedidoRead] = []


class PedidoPaginatedResponse(SQLModel):
    total: int
    offset: int
    limit: int
    items: List[PedidoRead]


class HistorialEstadoRead(SQLModel):
    id: int
    estado_desde: Optional[str]
    estado_hacia: str
    usuario_id: Optional[int]
    motivo: Optional[str]
    created_at: datetime