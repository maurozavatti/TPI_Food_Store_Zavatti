import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { createProducto, deleteProducto, getProductos, updateProducto, updateStock } from '../api/productos'
import type { FiltrosProductos, Producto, ProductoInput, ProductoStockUpdate } from '../types/producto'

const SIN_DATOS: Producto[] = []

// Lectura paginada en el SERVIDOR: la queryKey incluye los filtros → cada página/filtro tiene su caché
export const useProductos = (filtros: FiltrosProductos) => {
  const query = useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => getProductos(filtros),
    placeholderData: keepPreviousData, // mientras llega la página nueva se sigue mostrando la anterior
  })
  return {
    productos: query.data?.items ?? SIN_DATOS,
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
  }
}

// Escrituras del panel de administración
export const useProductosMutations = () => {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

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

  const cambiarStock = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoStockUpdate }) => updateStock(id, datos),
    onSuccess: (p) => {
      invalidar()
      showNotification(`Stock de "${p.nombre}": ${p.stock}${p.disponible ? '' : ' (no disponible)'}`, 'success')
    },
    onError: avisarError,
  })

  const eliminar = useMutation({
    mutationFn: deleteProducto,
    onSuccess: () => {
      invalidar()
      showNotification('Producto dado de baja', 'success')
    },
    onError: avisarError,
  })

  return { crear, actualizar, cambiarStock, eliminar }
}
