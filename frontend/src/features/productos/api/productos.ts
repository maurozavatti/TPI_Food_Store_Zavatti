import { api } from '@/shared/api/axiosInstance'
import type { FiltrosProductos, Producto, ProductoInput, ProductosPaginados, ProductoStockUpdate } from '../types/producto'

export const getProductos = async (filtros: FiltrosProductos) =>
  (await api.get<ProductosPaginados>('/productos', { params: filtros })).data

export const createProducto = async (datos: ProductoInput) => (await api.post<Producto>('/productos', datos)).data

export const updateProducto = async (id: number, datos: ProductoInput) =>
  (await api.put<Producto>(`/productos/${id}`, datos)).data

export const updateStock = async (id: number, datos: ProductoStockUpdate) =>
  (await api.patch<Producto>(`/productos/${id}/stock`, datos)).data

export const deleteProducto = async (id: number) => {
  await api.delete(`/productos/${id}`)
}