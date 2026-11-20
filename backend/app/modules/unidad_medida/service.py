from app.core.exceptions import NotFoundError
from app.core.unit_of_work import UnitOfWork
from .schemas import UnidadMedidaListResponse, UnidadMedidaRead


def listar(uow: UnitOfWork) -> UnidadMedidaListResponse:
    with uow:
        items = [UnidadMedidaRead.model_validate(u) for u in uow.unidades_medida.listar()]
        return UnidadMedidaListResponse(total=len(items), items=items)


def obtener(uow: UnitOfWork, id: int) -> UnidadMedidaRead:
    with uow:
        unidad = uow.unidades_medida.get(id)
        if not unidad:
            raise NotFoundError("Unidad de medida no encontrada")
        return UnidadMedidaRead.model_validate(unidad)