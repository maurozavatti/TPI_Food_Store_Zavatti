import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../api/categorias'
import type { Categoria, CategoriaInput } from '../types/categoria'

const SIN_DATOS: Categoria[] = []

// Lectura y escritura de categorías (las lecturas las usa también el catálogo para el filtro)
export const useCategorias = () => {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  const query = useQuery({ queryKey: ['categorias'], queryFn: getCategorias })

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['categorias'] })
    queryClient.invalidateQueries({ queryKey: ['productos'] }) // los productos muestran su categoría
  }
  const avisarError = (error: Error) => showNotification(error.message, 'error')

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
      showNotification('Categoría dada de baja', 'success')
    },
    onError: avisarError,
  })

  return {
    categorias: query.data ?? SIN_DATOS,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    crear,
    actualizar,
    eliminar,
  }
}