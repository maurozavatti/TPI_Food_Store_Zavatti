import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { requestLogin, requestLogout, requestMe } from '@/features/auth/api/auth'
import type { Rol, Usuario, UsuarioAuth } from '@/features/auth/types/auth'
import { queryClient } from '@/shared/api/queryClient'

interface AuthState {
  usuario: UsuarioAuth | null // nombre, email y rol para la interfaz. NUNCA el token (viaja en la cookie HttpOnly)
  cargando: boolean // true mientras checkSession confirma la sesión con /auth/me
  aviso: string | null // mensaje para el login (ej: "Tu sesión venció")

  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkSession: () => Promise<void>
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,
      aviso: null,

      login: async (username, password) => {
        await requestLogin(username, password) // si falla (401 / 400), el error sube a la página
        const usuario = await requestMe()
        if (!usuario) throw new Error('No se pudo obtener el usuario')
        set({ usuario: aUsuarioAuth(usuario), aviso: null })
      },

      logout: async () => {
        try {
          await requestLogout() // el servidor borra la cookie
        } finally {
          set({ usuario: null, aviso: null })
          queryClient.clear() // que el próximo usuario no vea datos en caché del anterior
        }
      },

      // Se llama una vez al montar la app: confirma con el backend que la cookie sigue siendo válida
      checkSession: async () => {
        set({ cargando: true })
        try {
          const usuario = await requestMe()
          set({ usuario: usuario ? aUsuarioAuth(usuario) : null })
        } catch {
          set({ usuario: null }) // backend caído o error de red
        } finally {
          set({ cargando: false })
        }
      },

      clearSession: (aviso) => {
        set({ usuario: null, aviso: aviso ?? null })
        queryClient.clear()
      },

      hasRole: (roles) => {
        const usuario = get().usuario
        return usuario !== null && roles.includes(usuario.role)
      },
    }),
    {
      name: 'auth-storage',
      // partialize: SOLO el usuario. Ni el token (no lo tenemos) ni los estados temporales
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
)