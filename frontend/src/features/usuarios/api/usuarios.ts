import { api } from '@/shared/api/axiosInstance'
import type { Usuario } from '../types/usuario'

export const getUsuarios = async () => (await api.get<Usuario[]>('/admin/usuarios')).data

export const activarUsuario = async (id: number) => (await api.post<Usuario>(`/admin/usuarios/${id}/activar`)).data

export const desactivarUsuario = async (id: number) =>
  (await api.post<Usuario>(`/admin/usuarios/${id}/desactivar`)).data