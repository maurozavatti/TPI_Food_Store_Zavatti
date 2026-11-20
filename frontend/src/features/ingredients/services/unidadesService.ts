import { api } from '@/shared/api/api'
import type { UnidadMedidaListResponse } from '../types/unidadMedida'

export const getUnidadesMedida = async () => (await api.get<UnidadMedidaListResponse>('/unidades-medida/')).data