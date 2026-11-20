"""Importa los 5 modelos de tabla en un solo lugar.

SQLModel necesita que TODAS las clases con table=True estén importadas antes de
create_all y antes de usar las relaciones (que se declaran con el nombre de la clase como texto).
"""
from app.modules.categorias.models import Categoria  # noqa: F401
from app.modules.pedidos.models import DetallePedido, Pedido  # noqa: F401
from app.modules.productos.models import Producto  # noqa: F401
from app.modules.usuarios.models import Usuario  # noqa: F401