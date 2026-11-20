import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../services/categoriesService'
import type { Categoria, CategoriaInput } from '../types/categoria'

// Referencia fija para "sin datos" (un [] nuevo en cada render haría recalcular la tabla)
const SIN_DATOS: Categoria[] = []

// Encapsula TODO el acceso a datos de categorías: la página no ve Axios ni TanStack Query
export const useCategories = () => {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  // ---------- QUERY: leer ----------
  const query = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['categorias'] })
    queryClient.invalidateQueries({ queryKey: ['productos'] }) // los productos muestran sus categorías
  }
  const avisarError = (error: Error) => showNotification(error.message, 'error')

  // ---------- MUTATIONS: escribir ----------
  const crear = useMutation({
    mutationFn: createCategoria,
    onSuccess: (c) => {
      invalidar()
      showNotification(`Categoría "${c.nombre}" creada`, 'success')
    },
    onError: avisarError,
  })

  const actualizar = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaInput }) => updateCategoria(id, datos),
    onSuccess: (c) => {
      invalidar()
      showNotification(`Categoría "${c.nombre}" actualizada`, 'success')
    },
    onError: avisarError,
  })

  const eliminar = useMutation({
    mutationFn: deleteCategoria,
    onSuccess: () => {
      invalidar()
      showNotification('Categoría eliminada', 'success')
    },
    onError: avisarError,
  })

  return {
    categorias: query.data?.items ?? SIN_DATOS,
    total: query.data?.total,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    crear,
    actualizar,
    eliminar,
  }
}