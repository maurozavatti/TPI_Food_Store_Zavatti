import { api } from '@/shared/api/api'
import type { PaginatedResponse } from '@/shared/types/api'
import type { Producto, ProductoInput } from '../types/producto'

export const getProductos = async () =>
  (await api.get<PaginatedResponse<Producto>>('/productos/', { params: { limit: 100 } })).data

export const createProducto = async (datos: ProductoInput) => (await api.post<Producto>('/productos/', datos)).data

export const updateProducto = async (id: number, datos: ProductoInput) =>
  (await api.put<Producto>(`/productos/${id}`, datos)).data

export const deleteProducto = async (id: number) => {
  await api.delete(`/productos/${id}`)
}