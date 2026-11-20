import { api } from '@/shared/api/api'
import type { PaginatedResponse } from '@/shared/types/api'
import type { Categoria, CategoriaInput } from '../types/categoria'

// Traemos hasta 100: la tabla (TanStack Table) ordena, busca y pagina en el cliente
export const getCategorias = async () =>
  (await api.get<PaginatedResponse<Categoria>>('/categorias/', { params: { limit: 100 } })).data

export const createCategoria = async (datos: CategoriaInput) =>
  (await api.post<Categoria>('/categorias/', datos)).data

export const updateCategoria = async (id: number, datos: CategoriaInput) =>
  (await api.put<Categoria>(`/categorias/${id}`, datos)).data

export const deleteCategoria = async (id: number) => {
  await api.delete(`/categorias/${id}`)
}