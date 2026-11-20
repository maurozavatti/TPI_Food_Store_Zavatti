from typing import Generic, List, Optional, Tuple, Type, TypeVar

from sqlmodel import Session, SQLModel, func, select
from sqlmodel.sql.expression import SelectOfScalar

from app.core.utils import utc_now

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Operaciones de acceso a datos comunes a todas las entidades.

    Regla: el repository NUNCA hace commit ni rollback (eso es del Unit of Work).
    Solo usa flush() cuando necesita que la base genere el id.
    """

    model: Type[T]

    def __init__(self, session: Session):
        self.session = session

    def get(self, id) -> Optional[T]:
        return self.session.get(self.model, id)

    def get_activo(self, id) -> Optional[T]:
        """Devuelve la entidad solo si existe y no está borrada lógicamente."""
        obj = self.get(id)
        if obj is None or getattr(obj, "deleted_at", None) is not None:
            return None
        return obj

    def add(self, obj: T) -> T:
        self.session.add(obj)
        self.session.flush()  # genera el id sin confirmar la transacción
        self.session.refresh(obj)
        return obj

    def update(self, obj: T, cambios: dict) -> T:
        obj.sqlmodel_update(cambios)
        if hasattr(obj, "updated_at"):
            obj.updated_at = utc_now()
        self.session.add(obj)
        self.session.flush()
        return obj

    def soft_delete(self, obj: T) -> None:
        ahora = utc_now()
        obj.deleted_at = ahora
        if hasattr(obj, "updated_at"):
            obj.updated_at = ahora
        self.session.add(obj)
        self.session.flush()

    def paginar(self, consulta: SelectOfScalar, offset: int, limit: int) -> Tuple[int, List[T]]:
        """Cuenta el total de la consulta y devuelve solo la página pedida."""
        total = self.session.exec(select(func.count()).select_from(consulta.subquery())).one()
        items = self.session.exec(consulta.offset(offset).limit(limit)).all()
        return total, list(items)