"""Carga inicial IDEMPOTENTE: se puede correr muchas veces sin duplicar nada.

    python -m app.db.seed

Crea el usuario admin (admin / Admin1234!), un cliente de prueba (juan / Juan1234!),
4 categorías y 12 productos con stock. Busca cada registro por su nombre (o username)
y solo lo crea si no existe.
"""
from sqlmodel import Session, select

from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.models import Categoria, Producto, Usuario

USUARIOS = [
    {"username": "admin", "full_name": "Administrador", "email": "admin@foodstore.com", "password": "Admin1234!", "role": "admin"},
    {"username": "juan", "full_name": "Juan Pérez", "email": "juan@foodstore.com", "password": "Juan1234!", "role": "user"},
]

CATEGORIAS = [
    {"nombre": "Pizzas", "descripcion": "Pizzas a la piedra"},
    {"nombre": "Hamburguesas", "descripcion": "Hamburguesas caseras con papas"},
    {"nombre": "Empanadas", "descripcion": "Empanadas al horno"},
    {"nombre": "Bebidas", "descripcion": "Gaseosas, aguas y cervezas"},
]


def _img(texto: str) -> str:
    return f"https://placehold.co/400x300/orange/white?text={texto.replace(' ', '+')}"


# (categoría, nombre, descripción, precio, stock)
PRODUCTOS = [
    ("Pizzas", "Pizza Muzzarella", "Salsa de tomate, muzzarella y aceitunas", 8500, 20),
    ("Pizzas", "Pizza Napolitana", "Muzzarella, tomate en rodajas y ajo", 9800, 15),
    ("Pizzas", "Pizza Fugazzeta", "Cebolla y muzzarella", 9500, 12),
    ("Hamburguesas", "Hamburguesa Clásica", "Carne, lechuga, tomate y queso", 7200, 25),
    ("Hamburguesas", "Hamburguesa Doble Cheddar", "Doble carne, doble cheddar y panceta", 9900, 18),
    ("Hamburguesas", "Hamburguesa Veggie", "Medallón de lentejas y vegetales", 7800, 10),
    ("Empanadas", "Empanada de Carne", "Carne cortada a cuchillo", 1300, 60),
    ("Empanadas", "Empanada de Jamón y Queso", "Jamón cocido y muzzarella", 1200, 60),
    ("Empanadas", "Empanada de Pollo", "Pollo, cebolla y morrón", 1250, 40),
    ("Bebidas", "Gaseosa Cola 1.5 L", "Botella de 1,5 litros", 3200, 30),
    ("Bebidas", "Agua Mineral 500 mL", "Sin gas", 1500, 40),
    ("Bebidas", "Cerveza Rubia 1 L", "Botella retornable", 4500, 24),
]


def _cargar_usuarios(session: Session) -> None:
    for datos in USUARIOS:
        if session.exec(select(Usuario).where(Usuario.username == datos["username"])).first():
            continue
        datos = dict(datos)
        password = datos.pop("password")
        session.add(Usuario(**datos, hashed_password=hash_password(password)))


def _cargar_categorias(session: Session) -> dict[str, Categoria]:
    categorias: dict[str, Categoria] = {}
    for datos in CATEGORIAS:
        categoria = session.exec(select(Categoria).where(Categoria.nombre == datos["nombre"])).first()
        if categoria is None:
            categoria = Categoria(**datos)
            session.add(categoria)
            session.flush()  # genera el id para usarlo en los productos
        categorias[categoria.nombre] = categoria
    return categorias


def _cargar_productos(session: Session, categorias: dict[str, Categoria]) -> None:
    for nombre_categoria, nombre, descripcion, precio, stock in PRODUCTOS:
        if session.exec(select(Producto).where(Producto.nombre == nombre)).first():
            continue
        session.add(
            Producto(
                categoria_id=categorias[nombre_categoria].id,
                nombre=nombre,
                descripcion=descripcion,
                precio_base=precio,
                imagen_url=_img(nombre),
                stock=stock,
            )
        )


def run_seed() -> None:
    create_all_tables()  # por si se corre antes de levantar la API
    with session_factory() as session:
        _cargar_usuarios(session)
        categorias = _cargar_categorias(session)
        _cargar_productos(session, categorias)
        session.commit()


if __name__ == "__main__":
    run_seed()
    print("Seed cargado: admin (admin / Admin1234!), juan (juan / Juan1234!), categorías y productos")