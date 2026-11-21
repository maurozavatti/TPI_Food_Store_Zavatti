import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getPedidos } from '../api/pedidos'
import type { FiltrosPedidos, Pedido } from '../types/pedido'

const SIN_DATOS: Pedido[] = []

// Propios (user) o todos (admin): lo decide el backend según la cookie
export const usePedidos = (filtros: FiltrosPedidos) => {
  const query = useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => getPedidos(filtros),
    placeholderData: keepPreviousData,
  })
  return {
    pedidos: query.data?.items ?? SIN_DATOS,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  }
}
