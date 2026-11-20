from typing import Generic, Optional, Sequence, Type, TypeVar

from sqlmodel import Session, SQLModel, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Acceso a datos común a todas las entidades. SIN reglas de negocio.

    Nunca hace commit ni rollback (eso es del Unit of Work): solo flush()
    cuando necesita que la base genere el id.
    """

    model: Type[T]

    def __init__(self, session: Session) -> None:
        self.session = session

    def get_by_id(self, id: int) -> Optional[T]:
        return self.session.get(self.model, id)

    def get_all(self) -> Sequence[T]:
        return self.session.exec(select(self.model)).all()

    def add(self, obj: T) -> T:
        """Inserta o actualiza. flush + refresh: el objeto vuelve con su id y sus valores por defecto."""
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def delete(self, obj: T) -> None:
        """Borrado FÍSICO. En este proyecto casi no se usa: las bajas son lógicas (activo / disabled)."""
        self.session.delete(obj)
        self.session.flush()