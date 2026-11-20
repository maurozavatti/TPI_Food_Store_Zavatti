import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { createProducto, deleteProducto, getProductos, updateProducto } from '../services/productsService'
import type { Producto, ProductoInput } from '../types/producto'

const SIN_DATOS: Producto[] = []

// Encapsula TODO el acceso a datos de productos: la página no ve Axios ni TanStack Query
export const useProducts = () => {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  const query = useQuery({ queryKey: ['productos'], queryFn: getProductos })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['productos'] })
  const avisarError = (error: Error) => showNotification(error.message, 'error')

  const crear = useMutation({
    mutationFn: createProducto,
    onSuccess: (p) => {
      invalidar()
      showNotification(`Producto "${p.nombre}" creado`, 'success')
    },
    onError: avisarError,
  })

  const actualizar = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoInput }) => updateProducto(id, datos),
    onSuccess: (p) => {
      invalidar()
      showNotification(`Producto "${p.nombre}" actualizado`, 'success')
    },
    onError: avisarError,
  })

  const eliminar = useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      invalidar()
      queryClient.invalidateQueries({ queryKey: ['categorias'] }) // RN-05 puede cambiar
      showNotification('Producto eliminado', 'success')
    },
    onError: avisarError,
  })

  return {
    productos: query.data?.items ?? SIN_DATOS,
    total: query.data?.total,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    crear,
    actualizar,
    eliminar,
  }
}