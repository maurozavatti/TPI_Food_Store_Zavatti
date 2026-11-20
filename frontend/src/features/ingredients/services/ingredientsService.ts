import { api } from '@/shared/api/api'
import type { PaginatedResponse } from '@/shared/types/api'
import type { Ingrediente, IngredienteInput } from '../types/ingrediente'

export const getIngredientes = async () =>
  (await api.get<PaginatedResponse<Ingrediente>>('/ingredientes/', { params: { limit: 100 } })).data

export const createIngrediente = async (datos: IngredienteInput) =>
  (await api.post<Ingrediente>('/ingredientes/', datos)).data

export const updateIngrediente = async (id: number, datos: IngredienteInput) =>
  (await api.put<Ingrediente>(`/ingredientes/${id}`, datos)).data

export const deleteIngrediente = async (id: number) => {
  await api.delete(`/ingredientes/${id}`)
}