from typing import Annotated, Callable

from fastapi import Depends
from sqlmodel import Session

from app.core.database import session_factory
from app.modules.categoria.repository import CategoriaRepository
from app.modules.ingrediente.repository import IngredienteRepository
from app.modules.producto.repository import ProductoRepository
from app.modules.unidad_medida.repository import UnidadMedidaRepository
from app.modules.pedido.repository import EstadoPedidoRepository, FormaPagoRepository, PedidoRepository
from app.modules.usuarios.repository import UsuarioRepository


class UnitOfWork:
    """Controla la transacción: todo lo que pasa dentro del `with uow:` se confirma junto
    (commit) o se descarta junto (rollback) si hubo una excepción.

    Todos los repositories comparten LA MISMA sesión → una sola transacción.
    """

    def __init__(self, factory: Callable[[], Session] = session_factory):
        self._factory = factory

# 1. Python llama a uow.__enter__() → abre la sesión y crea los repos
# 2. el código
# 3. al salir, Python llama a uow.__exit__(...) SIEMPRE, haya error o no

    def __enter__(self) -> "UnitOfWork":
        self.session = self._factory()
        self.categorias = CategoriaRepository(self.session)
        self.productos = ProductoRepository(self.session)
        self.ingredientes = IngredienteRepository(self.session)
        self.unidades_medida = UnidadMedidaRepository(self.session)
        self.pedidos = PedidoRepository(self.session)
        self.estados_pedido = EstadoPedidoRepository(self.session)
        self.formas_pago = FormaPagoRepository(self.session)
        self.usuarios = UsuarioRepository(self.session)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            if exc_type:
                self.session.rollback()  # algo falló → no se guarda nada
            else:
                self.session.commit()  # todo OK → se guarda todo
        finally:
            self.session.close()
        # No devolvemos True: si hubo excepción, se vuelve a lanzar (el router/handler la responde)


def get_uow() -> UnitOfWork:
    return UnitOfWork()


UowDep = Annotated[UnitOfWork, Depends(get_uow)]