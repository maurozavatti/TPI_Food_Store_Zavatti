import { api } from '@/shared/api/axiosInstance'
import type { Categoria, CategoriaInput } from '../types/categoria'

export const getCategorias = async () => (await api.get<Categoria[]>('/categorias')).data

export const createCategoria = async (datos: CategoriaInput) => (await api.post<Categoria>('/categorias', datos)).data

export const updateCategoria = async (id: number, datos: CategoriaInput) =>
  (await api.put<Categoria>(`/categorias/${id}`, datos)).data

export const deleteCategoria = async (id: number) => {
  await api.delete(`/categorias/${id}`)
}