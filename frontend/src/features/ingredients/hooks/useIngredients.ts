import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { createIngrediente, deleteIngrediente, getIngredientes, updateIngrediente } from '../services/ingredientsService'
import type { Ingrediente, IngredienteInput } from '../types/ingrediente'

const SIN_DATOS: Ingrediente[] = []

// Encapsula TODO el acceso a datos de ingredientes: la página no ve Axios ni TanStack Query
export const useIngredients = () => {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  const query = useQuery({ queryKey: ['ingredientes'], queryFn: getIngredientes })

  const invalidar = () => {
    queryClient.invalidateQueries({ queryKey: ['ingredientes'] })
    queryClient.invalidateQueries({ queryKey: ['productos'] }) // los productos muestran sus ingredientes
  }
  const avisarError = (error: Error) => showNotification(error.message, 'error')

  const crear = useMutation({
    mutationFn: createIngrediente,
    onSuccess: (i) => {
      invalidar()
      showNotification(`Ingrediente "${i.nombre}" creado`, 'success')
    },
    onError: avisarError,
  })

  const actualizar = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: IngredienteInput }) => updateIngrediente(id, datos),
    onSuccess: (i) => {
      invalidar()
      showNotification(`Ingrediente "${i.nombre}" actualizado`, 'success')
    },
    onError: avisarError,
  })

  const eliminar = useMutation({
    mutationFn: deleteIngrediente,
    onSuccess: () => {
      invalidar()
      showNotification('Ingrediente eliminado', 'success')
    },
    onError: avisarError,
  })

  return {
    ingredientes: query.data?.items ?? SIN_DATOS,
    total: query.data?.total,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    crear,
    actualizar,
    eliminar,
  }
}