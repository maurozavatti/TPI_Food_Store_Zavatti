from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.database import create_db_and_tables
from app.core.exceptions import DomainError
from app.core.seed import run_seed

# Importar TODOS los modelos antes de create_all para que SQLModel registre las tablas
from app.modules.unidad_medida.models import UnidadMedida  # noqa: F401
from app.modules.producto.models import Producto, ProductoCategoria, ProductoIngrediente  # noqa: F401
from app.modules.categoria.models import Categoria  # noqa: F401
from app.modules.ingrediente.models import Ingrediente  # noqa: F401
from app.modules.usuarios.models import Usuario  # noqa: F401

from app.modules.categoria.router import router as categoria_router
from app.modules.health.router import router as health_router
from app.modules.ingrediente.router import router as ingrediente_router
from app.modules.producto.router import router as producto_router
from app.modules.unidad_medida.router import router as unidad_medida_router
from app.modules.pedido.router import catalogos_router, router as pedido_router
from app.modules.usuarios.router import router as auth_router


from app.modules.pedido.models import (  # noqa: F401
    DetallePedido,
    EstadoPedido,
    FormaPago,
    HistorialEstadoPedido,
    Pedido,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    run_seed()
    yield


app = FastAPI(
    title="API Catálogo + Ventas (con seguridad)",
    description="TP Unidad 9 - JWT en cookie HttpOnly, roles y Unit of Work",
    version="4.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Traduce los errores de negocio (lanzados por los services) a respuestas HTTP
@app.exception_handler(DomainError)
async def domain_error_handler(request: Request, exc: DomainError):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


API_PREFIX = "/api/v1"
for r in (
    health_router,
    auth_router,
    categoria_router,
    producto_router,
    ingrediente_router,
    unidad_medida_router,
    pedido_router,
    catalogos_router,
):
    app.include_router(r, prefix=API_PREFIX)


@app.get("/")
def root():
    return {"mensaje": "API Catálogo + Ventas funcionando", "docs": "/docs"}