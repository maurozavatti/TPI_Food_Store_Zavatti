from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL.get_secret_value(), echo=False)


def create_db_and_tables() -> None:
    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # expire_on_commit=False: los objetos siguen legibles después del commit
    return Session(engine, expire_on_commit=False)