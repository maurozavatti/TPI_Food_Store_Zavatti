from typing import Callable, Self

from sqlmodel import Session

from app.core.database import session_factory


class UnitOfWork:
    """Unit of Work BASE: una transacción por bloque `with`.

    - __enter__: abre la sesión y crea los repositorios del módulo.
    - __exit__: si no hubo excepción → commit; si la hubo → rollback. Siempre close.

    Cada módulo hereda de esta clase y en `_crear_repositorios` crea SUS repositorios,
    todos sobre la MISMA sesión (por eso comparten la transacción).
    Ningún Service ni Router llama a session.commit(): el commit ocurre solo acá.
    """

    session: Session

    def __init__(self, factory: Callable[[], Session] = session_factory) -> None:
        self._factory = factory

    def __enter__(self) -> Self:
        self.session = self._factory()
        self._crear_repositorios()
        return self

    def _crear_repositorios(self) -> None:
        """Lo redefine cada módulo."""

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        try:
            if exc_type is None:
                self.session.commit()  # todo OK → se guarda todo
            else:
                self.session.rollback()  # algo falló → no se guarda nada
        finally:
            self.session.close()
        # No devuelve True: la excepción sigue su camino hasta el Router