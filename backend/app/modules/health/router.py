from fastapi import APIRouter, HTTPException, status
from sqlmodel import text

from app.core.unit_of_work import UowDep

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("/")
def health():
    return {"status": "ok"}


@router.get("/db")
def health_db(uow: UowDep):
    try:
        with uow:
            uow.session.exec(text("SELECT 1"))
        return {"status": "ok", "database": "conectada"}
    except Exception:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="Base de datos no disponible")