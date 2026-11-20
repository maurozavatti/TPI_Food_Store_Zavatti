from datetime import datetime
from decimal import Decimal
from typing import Any, List, Optional

from sqlalchemy import CheckConstraint, Column, DateTime, SmallInteger, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import Field, Relationship, SQLModel

from app.core.utils import utc_now


# ---------------------------------------------------------
# Catálogos (solo lectura, cargados por seed)
# ---------------------------------------------------------
class EstadoPedido(SQLModel, table=True):
    __tablename__ = "estados_pedido"

    codigo: str = Field(primary_key=True, max_length=20)
    descripcion: str = Field(max_length=80)
    orden: int
    es_terminal: bool


class FormaPago(SQLModel, table=True):
    __tablename__ = "formas_pago"

    codigo: str = Field(primary_key=True, max_length=30)
    descripcion: str = Field(max_length=80)
    activo: bool = Field(default=True)


# ---------------------------------------------------------
# Pedido
# ---------------------------------------------------------
class Pedido(SQLModel, table=True):
    __tablename__ = "pedidos"
    __table_args__ = (CheckConstraint("total >= 0", name="ck_pedidos_total"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    
    usuario_id: int = Field(foreign_key="usuarios.id", index=True)  # dueño del pedido
    direccion_id: Optional[int] = Field(default=None)
    estado_codigo: str = Field(foreign_key="estados_pedido.codigo", max_length=20)
    forma_pago_codigo: str = Field(foreign_key="formas_pago.codigo", max_length=30)

    # Snapshot monetario
    subtotal: Decimal = Field(max_digits=10, decimal_places=2)
    descuento: Decimal = Field(default=Decimal("0"), max_digits=10, decimal_places=2)
    costo_envio: Decimal = Field(default=Decimal("0"), max_digits=10, decimal_places=2)
    total: Decimal = Field(max_digits=10, decimal_places=2)

    notas: Optional[str] = Field(default=None, sa_type=Text)

    # Auditoría
    created_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))
    deleted_at: Optional[datetime] = Field(default=None, sa_type=DateTime(timezone=True))

    detalles: List["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    """Fila inmutable: sin updated_at. Guarda un snapshot del producto al momento de la compra."""

    __tablename__ = "detalles_pedido"
    __table_args__ = (
        CheckConstraint("cantidad >= 1", name="ck_detalles_cantidad"),
        CheckConstraint("precio_unitario_snap >= 0", name="ck_detalles_precio"),
    )

    pedido_id: int = Field(foreign_key="pedidos.id", primary_key=True, ondelete="CASCADE")
    producto_id: int = Field(foreign_key="productos.id", primary_key=True, ondelete="RESTRICT")
    cantidad: int = Field(sa_type=SmallInteger)

    # Snapshot
    nombre_producto_snap: str = Field(max_length=150)
    precio_unitario_snap: Decimal = Field(max_digits=10, decimal_places=2)
    subtotal_snap: Decimal = Field(max_digits=10, decimal_places=2)
    personalizacion: Optional[Any] = Field(default=None, sa_column=Column(JSONB, nullable=True))

    created_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))

    pedido: Optional[Pedido] = Relationship(back_populates="detalles")


class HistorialEstadoPedido(SQLModel, table=True):
    """Append-only: solo INSERT, nunca UPDATE ni DELETE."""

    __tablename__ = "historial_estados_pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedidos.id", ondelete="CASCADE", index=True)
    estado_desde: Optional[str] = Field(default=None, foreign_key="estados_pedido.codigo", max_length=20)  # NULL = inicial
    estado_hacia: str = Field(foreign_key="estados_pedido.codigo", max_length=20)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuarios.id")  # quién hizo el cambio
    motivo: Optional[str] = Field(default=None, sa_type=Text)

    created_at: datetime = Field(default_factory=utc_now, sa_type=DateTime(timezone=True))