from datetime import datetime
from enum import Enum
from typing import List, Optional

from sqlmodel import Field, SQLModel


class EstadoPedido(str, Enum):
    PENDIENTE = "PENDIENTE"
    EN_PREPARACION = "EN_PREPARACION"
    ENTREGADO = "ENTREGADO"
    CANCELADO = "CANCELADO"


class FormaPago(str, Enum):
    EFECTIVO = "EFECTIVO"
    TRANSFERENCIA = "TRANSFERENCIA"


# ---------- Entrada ----------
class ItemPedidoCreate(SQLModel):
    producto_id: int = Field(gt=0)
    cantidad: int = Field(ge=1)


class PedidoCreate(SQLModel):
    items: List[ItemPedidoCreate] = Field(min_length=1)  # al menos un ítem (RN-01)
    forma_pago: FormaPago  # RN-06
    direccion_entrega: str = Field(min_length=5, max_length=200)  # RN-06
    notas: Optional[str] = Field(default=None, max_length=500)


class CambioEstado(SQLModel):
    estado: EstadoPedido


# ---------- Salida ----------
class DetallePedidoRead(SQLModel):
    producto_id: int
    nombre_producto: str
    precio_unitario: float
    cantidad: int
    subtotal: float


class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    estado: EstadoPedido
    forma_pago: FormaPago
    direccion_entrega: str
    notas: Optional[str]
    total: float
    created_at: datetime
    updated_at: datetime
    items: List[DetallePedidoRead]  # se arma con la relación Pedido.items


class PedidosPaginados(SQLModel):
    total: int
    items: List[PedidoRead]


class ResumenPedidos(SQLModel):
    pendientes: int
    en_preparacion: int
    entregados: int
    cancelados: int
    pedidos_hoy: int
    ingresos_entregados: float