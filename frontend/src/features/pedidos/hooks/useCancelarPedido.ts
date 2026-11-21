import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { cancelarPedido } from '../api/pedidos'

// Cliente: cancela su propio pedido mientras está PENDIENTE
export const useCancelarPedido = () => {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  return useMutation({
    mutationFn: cancelarPedido,
    onSuccess: (pedido) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['productos'] }) // el stock se restituyó
      queryClient.invalidateQueries({ queryKey: ['resumen'] })
      showNotification(`Pedido #${pedido.id} cancelado`, 'success')
    },
    onError: (error: Error) => showNotification(error.message, 'error'),
  })
}
