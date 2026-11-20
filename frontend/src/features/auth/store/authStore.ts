import { create } from 'zustand'
import { queryClient } from '@/shared/api/queryClient'
import { requestLogin, requestLogout, requestMe } from '../services/authService'
import type { AuthStatus, Rol, Usuario, UsuarioAuth } from '../types/auth.types'

interface AuthState {
  user: UsuarioAuth | null // datos para la interfaz (NUNCA el token: está en la cookie HttpOnly)
  status: AuthStatus
  aviso: string | null // mensaje para el login (ej: "Tu sesión venció")

  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  clearSession: (aviso?: string) => void
  hasRole: (roles: Rol[]) => boolean
}

const aUsuarioAuth = ({ id, username, full_name, email, role }: Usuario): UsuarioAuth => ({
  id,
  username,
  full_name,
  email,
  role,
})

// SIN persist (RA-09): la sesión no se guarda en localStorage ni en sessionStorage.
// Al recargar la página se recupera preguntándole al backend con GET /auth/me.
export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  status: 'checking', // al arrancar todavía no sabemos si hay sesión
  aviso: null,

  login: async (username, password) => {
    await requestLogin(username, password) // el servidor guarda la cookie (si falla, lanza el error)
    const usuario = await requestMe()
    if (!usuario) throw new Error('No se pudo obtener el usuario')
    set({ user: aUsuarioAuth(usuario), status: 'authenticated', aviso: null })
  },

  logout: async () => {
    try {
      await requestLogout() // el servidor borra la cookie
    } finally {
      set({ user: null, status: 'unauthenticated', aviso: null })
      queryClient.clear() // que el próximo usuario no vea datos en caché del anterior
    }
  },

  checkAuth: async () => {
    try {
      const usuario = await requestMe() // GET /auth/me con la cookie
      set(usuario ? { user: aUsuarioAuth(usuario), status: 'authenticated' } : { user: null, status: 'unauthenticated' })
    } catch {
      set({ user: null, status: 'unauthenticated' }) // backend caído o error de red
    }
  },

  clearSession: (aviso) => {
    set({ user: null, status: 'unauthenticated', aviso: aviso ?? null })
    queryClient.clear()
  },

  hasRole: (roles) => {
    const user = get().user
    return user !== null && roles.includes(user.role)
  },
}))