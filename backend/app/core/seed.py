"""Carga inicial de las tablas catálogo (solo lectura). Idempotente.

Se ejecuta automáticamente al iniciar la API (lifespan en main.py).
También se puede correr a mano:  python -m app.core.seed
"""
from sqlmodel import Session, SQLModel, select

from app.core.database import session_factory
from app.modules.pedido.models import EstadoPedido, FormaPago
from app.modules.unidad_medida.models import UnidadMedida
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario

UNIDADES_MEDIDA = [
    {"id": 1, "nombre": "kilogramo", "simbolo": "kg", "tipo": "masa"},
    {"id": 2, "nombre": "gramo", "simbolo": "g", "tipo": "masa"},
    {"id": 3, "nombre": "litro", "simbolo": "L", "tipo": "volumen"},
    {"id": 4, "nombre": "mililitro", "simbolo": "mL", "tipo": "volumen"},
    {"id": 5, "nombre": "pieza", "simbolo": "u", "tipo": "unidad"},
    {"id": 6, "nombre": "docena", "simbolo": "doc", "tipo": "unidad"},
    {"id": 7, "nombre": "metro cuadrado", "simbolo": "m²", "tipo": "area"},
]

ESTADOS_PEDIDO = [
    {"codigo": "PENDIENTE", "descripcion": "Pedido recibido, pendiente de confirmación", "orden": 1, "es_terminal": False},
    {"codigo": "CONFIRMADO", "descripcion": "Pedido confirmado", "orden": 2, "es_terminal": False},
    {"codigo": "EN_PREP", "descripcion": "En preparación", "orden": 3, "es_terminal": False},
    {"codigo": "EN_CAMINO", "descripcion": "En camino al cliente", "orden": 4, "es_terminal": False},
    {"codigo": "ENTREGADO", "descripcion": "Entregado al cliente", "orden": 5, "es_terminal": True},
    {"codigo": "CANCELADO", "descripcion": "Pedido cancelado", "orden": 6, "es_terminal": True},
]

FORMAS_PAGO = [
    {"codigo": "EFECTIVO", "descripcion": "Efectivo"},
    {"codigo": "DEBITO", "descripcion": "Tarjeta de débito"},
    {"codigo": "CREDITO", "descripcion": "Tarjeta de crédito"},
    {"codigo": "TRANSFERENCIA", "descripcion": "Transferencia bancaria"},
    {"codigo": "MERCADO_PAGO", "descripcion": "Mercado Pago"},
]

# Usuarios iniciales para probar los dos roles (las contraseñas se guardan con hash bcrypt)
USUARIOS = [
    {"username": "admin", "full_name": "Administrador", "email": "admin@catalogo.com", "password": "Admin1234!", "role": "admin"},
    {"username": "juan", "full_name": "Juan Pérez", "email": "juan@catalogo.com", "password": "Juan1234!", "role": "user"},
]

def _cargar_si_vacia(session: Session, modelo: type[SQLModel], filas: list[dict]) -> None:
    if session.exec(select(modelo)).first():
        return  # ya tiene datos: no se vuelve a cargar
    for datos in filas:
        session.add(modelo(**datos))

def _cargar_usuarios(session: Session) -> None:
    if session.exec(select(Usuario)).first():
        return
    for datos in USUARIOS:
        datos = dict(datos)  # copia, para no modificar la constante
        password = datos.pop("password")
        session.add(Usuario(**datos, hashed_password=hash_password(password)))

def run_seed() -> None:
    with session_factory() as session:
        _cargar_si_vacia(session, UnidadMedida, UNIDADES_MEDIDA)
        _cargar_si_vacia(session, EstadoPedido, ESTADOS_PEDIDO)
        _cargar_si_vacia(session, FormaPago, FORMAS_PAGO)
        _cargar_usuarios(session)
        session.commit()


if __name__ == "__main__":
    run_seed()
    print("Seed cargado: unidades de medida, estados de pedido y formas de pago")