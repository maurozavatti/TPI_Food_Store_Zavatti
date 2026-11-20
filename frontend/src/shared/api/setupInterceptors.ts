import type { AxiosError } from 'axios'
import { useAuthStore } from '@/features/auth'
import { useNotificationStore } from '@/store/notificationStore'
import { api } from './api'
import { handleApiError } from './handleApiError'

// En estas rutas un 401 es parte del funcionamiento normal (login fallido / sin sesión)
const RUTAS_DE_AUTH = ['/auth/token', '/auth/me']

// Se ejecuta UNA sola vez, al importar este archivo desde main.tsx
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const url = error.config?.url ?? ''
    const esRutaDeAuth = RUTAS_DE_AUTH.some((ruta) => url.includes(ruta))
    const status = error.response?.status

    if (status === 401 && !esRutaDeAuth) {
      // Sesión vencida: se limpia el store → ProtectedRoute manda a /login
      useAuthStore.getState().clearSession('Tu sesión venció. Iniciá sesión de nuevo.')
    }

    if (status === 403) {
      // Sin permisos: solo se avisa. NO se cierra la sesión ni se redirige.
      useNotificationStore.getState().showNotification('Acceso denegado: no tenés permisos para esta acción.', 'error')
    }

    // Mensaje legible para la interfaz (los componentes usan error.message)
    error.message = handleApiError(error, esRutaDeAuth)
    return Promise.reject(error)
  },
)