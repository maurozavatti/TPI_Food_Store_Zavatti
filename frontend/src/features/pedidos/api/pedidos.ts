import { api } from '@/shared/api/axiosInstance'
import type { EstadoPedido, FiltrosPedidos, Pedido, PedidoCreate, PedidosPaginados, ResumenPedidos } from '../types/pedido'

export const getPedidos = async (filtros: FiltrosPedidos) =>
  (await api.get<PedidosPaginados>('/pedidos', { params: filtros })).data

export const getPedido = async (id: number) => (await api.get<Pedido>(`/pedidos/${id}`)).data

export const createPedido = async (datos: PedidoCreate) => (await api.post<Pedido>('/pedidos', datos)).data

export const cambiarEstadoPedido = async (id: number, estado: EstadoPedido) =>
  (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data

export const cancelarPedido = async (id: number) => (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data

export const getResumen = async () => (await api.get<ResumenPedidos>('/pedidos/resumen')).data