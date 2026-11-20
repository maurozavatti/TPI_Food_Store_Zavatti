from typing import List

from sqlmodel import select

from app.core.repository import BaseRepository
from .models import UnidadMedida


class UnidadMedidaRepository(BaseRepository[UnidadMedida]):
    model = UnidadMedida

    def listar(self) -> List[UnidadMedida]:
        return list(self.session.exec(select(UnidadMedida).order_by(UnidadMedida.id)).all())