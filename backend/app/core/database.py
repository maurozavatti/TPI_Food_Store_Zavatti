from sqlmodel import Session, SQLModel, create_engine

from app.core.config import settings


def _normalizar_url(url: str) -> str:
    """"postgresql://..." → "postgresql+psycopg2://..." para usar SIEMPRE el driver de requirements.txt
    (SQLAlchemy 2.1 cambió el driver por defecto de PostgreSQL a psycopg 3)."""
    if url.startswith("postgresql://"):
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


engine = create_engine(_normalizar_url(settings.DATABASE_URL.get_secret_value()), echo=False)


def create_all_tables() -> None:
    """Crea las tablas que falten. Los modelos tienen que estar importados antes (ver app/models.py)."""
    import app.models  # noqa: F401  (registra las 5 tablas en SQLModel.metadata)

    SQLModel.metadata.create_all(engine)


def session_factory() -> Session:
    # expire_on_commit=False: los objetos siguen legibles después del commit
    return Session(engine, expire_on_commit=False)