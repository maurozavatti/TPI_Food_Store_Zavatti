import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCartStore } from '@/store/cartStore'
import { useNotificationStore } from '@/store/notificationStore'
import { createPedido } from '../api/pedidos'

export const useCrearPedido = () => {
  const queryClient = useQueryClient()
  const vaciar = useCartStore((s) => s.vaciar)
  const showNotification = useNotificationStore((s) => s.showNotification)

  return useMutation({
    mutationFn: createPedido,
    onSuccess: (pedido) => {
      vaciar() // el carrito ya se convirtió en pedido
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['productos'] }) // el stock bajó
      queryClient.invalidateQueries({ queryKey: ['resumen'] })
      showNotification(`Pedido #${pedido.id} confirmado`, 'success')
    },
    onError: (error: Error) => {
      queryClient.invalidateQueries({ queryKey: ['productos'] }) // por si el stock cambió mientras tanto
      showNotification(error.message, 'error')
    },
  })
}
