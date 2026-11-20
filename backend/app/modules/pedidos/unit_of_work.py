from app.core.unit_of_work import UnitOfWork
from app.modules.productos.repository import ProductoRepository
from .repository import PedidoRepository


class PedidoUnitOfWork(UnitOfWork):
    """Pedidos y productos sobre la MISMA sesión: crear el pedido y descontar
    el stock (o cancelarlo y restituirlo) ocurre en una sola transacción."""

    pedidos: PedidoRepository
    productos: ProductoRepository

    def _crear_repositorios(self) -> None:
        self.pedidos = PedidoRepository(self.session)
        self.productos = ProductoRepository(self.session)