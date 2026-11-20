from typing import List

from .models import Categoria
from .schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


# ---------- Excepciones de dominio (el Router las traduce a HTTP) ----------
class CategoriaNoEncontrada(Exception):
    """→ 404"""


class NombreDuplicado(Exception):
    """→ 409"""


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork) -> None:
        self.uow = uow

    def listar(self) -> List[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.listar_activas()]

    def obtener(self, id: int) -> CategoriaRead:
        with self.uow as uow:
            return CategoriaRead.model_validate(self._buscar_activa(uow, id))

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            nombre = datos.nombre.strip()
            if uow.categorias.get_by_nombre(nombre):
                raise NombreDuplicado(f"Ya existe una categoría llamada '{nombre}'")
            categoria = Categoria(nombre=nombre, descripcion=datos.descripcion)
            return CategoriaRead.model_validate(uow.categorias.add(categoria))

    def actualizar(self, id: int, datos: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = self._buscar_activa(uow, id)
            cambios = datos.model_dump(exclude_unset=True)  # solo lo que se envió
            if "nombre" in cambios and cambios["nombre"] is not None:
                cambios["nombre"] = cambios["nombre"].strip()
                otra = uow.categorias.get_by_nombre(cambios["nombre"])
                if otra and otra.id != categoria.id:
                    raise NombreDuplicado(f"Ya existe una categoría llamada '{cambios['nombre']}'")
            elif "nombre" in cambios:
                del cambios["nombre"]  # nombre: null no borra el nombre
            categoria.sqlmodel_update(cambios)
            return CategoriaRead.model_validate(uow.categorias.add(categoria))

    def eliminar(self, id: int) -> None:
        """Baja lógica: activo = False (no se borra la fila)."""
        with self.uow as uow:
            categoria = self._buscar_activa(uow, id)
            categoria.activo = False
            uow.categorias.add(categoria)

    @staticmethod
    def _buscar_activa(uow: CategoriaUnitOfWork, id: int) -> Categoria:
        """Una categoría dada de baja se trata como inexistente."""
        categoria = uow.categorias.get_by_id(id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())