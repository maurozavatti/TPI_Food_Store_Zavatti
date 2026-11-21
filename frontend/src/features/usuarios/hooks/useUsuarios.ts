import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNotificationStore } from '@/store/notificationStore'
import { activarUsuario, desactivarUsuario, getUsuarios } from '../api/usuarios'
import type { Usuario } from '../types/usuario'

const SIN_DATOS: Usuario[] = []

// Gestión de usuarios (solo admin)
export const useUsuarios = () => {
  const queryClient = useQueryClient()
  const showNotification = useNotificationStore((s) => s.showNotification)

  const query = useQuery({ queryKey: ['usuarios'], queryFn: getUsuarios })

  const invalidar = () => queryClient.invalidateQueries({ queryKey: ['usuarios'] })
  const avisarError = (error: Error) => showNotification(error.message, 'error')

  const activar = useMutation({
    mutationFn: activarUsuario,
    onSuccess: (u) => {
      invalidar()
      showNotification(`Usuario "${u.username}" activado`, 'success')
    },
    onError: avisarError,
  })

  const desactivar = useMutation({
    mutationFn: desactivarUsuario,
    onSuccess: (u) => {
      invalidar()
      showNotification(`Usuario "${u.username}" desactivado`, 'success')
    },
    onError: avisarError,
  })

  return {
    usuarios: query.data ?? SIN_DATOS,
    total: query.data?.length,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    activar,
    desactivar,
  }
}