import { useQuery } from '@tanstack/react-query'
import { getResumen } from '../api/pedidos'

export const useResumenPedidos = () => useQuery({ queryKey: ['resumen'], queryFn: getResumen })
