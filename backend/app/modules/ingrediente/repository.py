from typing import List, Optional, Tuple

from sqlmodel import col, func, select

from app.core.repository import BaseRepository
from .models import Ingrediente


class IngredienteRepository(BaseRepository[Ingrediente]):
    model = Ingrediente

    def buscar_por_nombre_activo(self, nombre: str) -> Optional[Ingrediente]:
        consulta = select(Ingrediente).where(
            func.lower(func.trim(Ingrediente.nombre)) == nombre.strip().lower(),
            col(Ingrediente.deleted_at).is_(None),
        )
        return self.session.exec(consulta).first()

    def listar(
        self, offset: int, limit: int, nombre: Optional[str], incluir_inactivos: bool
    ) -> Tuple[int, List[Ingrediente]]:
        consulta = select(Ingrediente)
        if not incluir_inactivos:
            consulta = consulta.where(col(Ingrediente.deleted_at).is_(None))
        if nombre:
            consulta = consulta.where(col(Ingrediente.nombre).ilike(f"%{nombre}%"))
        return self.paginar(consulta.order_by(Ingrediente.id), offset, limit)