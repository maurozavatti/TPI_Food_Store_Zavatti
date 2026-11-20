import { isAxiosError } from 'axios'
import { api } from '@/shared/api/api'
import type { MensajeResponse, RegisterInput, Usuario } from '../types/auth.types'

// Login OAuth2: se envía como FORMULARIO (URLSearchParams), no como JSON.
// El servidor responde con la cookie HttpOnly; el token nunca llega a JavaScript.
export const requestLogin = async (username: string, password: string): Promise<void> => {
  await api.post<MensajeResponse>('/auth/token', new URLSearchParams({ username, password }))
}

// Devuelve el usuario si la cookie es válida, o null si no hay sesión (401) o la cuenta está desactivada (400)
export const requestMe = async (): Promise<Usuario | null> => {
  try {
    return (await api.get<Usuario>('/auth/me')).data
  } catch (error) {
    if (isAxiosError(error) && (error.response?.status === 401 || error.response?.status === 400)) return null
    throw error
  }
}

export const requestLogout = async (): Promise<void> => {
  await api.post<MensajeResponse>('/auth/logout')
}

export const requestRegister = async (datos: RegisterInput): Promise<Usuario> =>
  (await api.post<Usuario>('/auth/register', datos)).data