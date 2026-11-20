import { api } from '@/shared/api/api'
import type { Usuario } from '../types/auth.types'

export const getUsuarios = async () => (await api.get<Usuario[]>('/auth/admin/usuarios')).data

export const activarUsuario = async (id: number) =>
  (await api.post<Usuario>(`/auth/admin/usuarios/${id}/activar`)).data

export const desactivarUsuario = async (id: number) =>
  (await api.post<Usuario>(`/auth/admin/usuarios/${id}/desactivar`)).data