from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import create_all_tables
from app.db.seed import run_seed
from app.modules.auth.router import router as auth_router
from app.modules.usuarios.router import router as usuarios_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.pedidos.router import router as pedidos_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_all_tables()
    run_seed()  # idempotente: si ya están los datos, no hace nada
    yield


app = FastAPI(
    title="Food Store API",
    description="TPI Programación IV – Sistema de pedidos de comida (FastAPI + SQLModel + Unit of Work)",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS con credenciales: el navegador manda la cookie solo si el origen está permitido explícitamente
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
for r in (auth_router, usuarios_router, categorias_router, productos_router, pedidos_router):
    app.include_router(r, prefix=API_PREFIX)


@app.get("/", tags=["Salud"])
def root():
    return {"mensaje": "Food Store API funcionando", "docs": "/docs"}