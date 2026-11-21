import type { AxiosError } from 'axios'
import { useAuthStore } from '@/store/authStore'
import { useNotificationStore } from '@/store/notificationStore'
import { api } from './axiosInstance'
import { handleApiError } from './handleApiError'

// En estas rutas un 401 es parte del funcionamiento normal (login fallido / todavía sin sesión)
const RUTAS_DE_AUTH = ['/auth/token', '/auth/me']
const CUENTA_DESACTIVADA = 'Cuenta de usuario desactivada'

// Se registra UNA sola vez, al importar este archivo desde main.tsx
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: unknown }>) => {
    const url = error.config?.url ?? ''
    const esRutaDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta))
    const status = error.response?.status
    const detail = error.response?.data?.detail

    if (status === 401 && !esRutaDeAuth) {
      // Sesión vencida: se limpia el authStore → ProtectedRoute manda a /login
      useAuthStore.getState().clearSession('Tu sesión venció. Iniciá sesión de nuevo.')
    } else if (status === 400 && detail === CUENTA_DESACTIVADA && !url.includes('/auth/token')) {
      useAuthStore.getState().clearSession('Tu cuenta fue desactivada.')
    } else if (status === 403) {
      // Sin permisos: solo se avisa (no se cierra la sesión)
      useNotificationStore.getState().showNotification('Acceso denegado: no tenés permisos para esta acción.', 'error')
    }

    error.message = handleApiError(error, esRutaDeAuth) // mensaje legible a partir del detail
    return Promise.reject(error)
  },
)