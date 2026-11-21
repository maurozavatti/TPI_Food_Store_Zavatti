import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { cambiarEstadoPedido } from '../api/pedidos'
import type { EstadoPedido } from '../types/pedido'

// Admin: avanza o cancela según la máquina de estados
export const useCambiarEstadoPedido = () => {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) => cambiarEstadoPedido(id, estado),
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['resumen'] })
      if (pedido.estado === 'CANCELADO') queryClient.invalidateQueries({ queryKey: ['productos'] }) // stock restituido
      showNotification(`Pedido #${pedido.id}: ${pedido.estado.replace('_', ' ')}`, 'success')
    },
    onError: (error: Error) => showNotification(error.message, 'error'),
  })
}
