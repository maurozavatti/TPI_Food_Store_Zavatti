import { useNavigate } from 'react-router-dom'
import { useNotificationStore } from '@/store/notificationStore'
import { useAuthStore } from '../store/authStore'

// Única puerta de entrada de los componentes a la sesión: leen el store y llaman a login / logout desde acá
export const useAuth = () => {
  const user = useAuthStore((s) => s.user)
  const status = useAuthStore((s) => s.status)
  const aviso = useAuthStore((s) => s.aviso)
  const loginStore = useAuthStore((s) => s.login)
  const logoutStore = useAuthStore((s) => s.logout)
  const hasRole = useAuthStore((s) => s.hasRole)
  const showNotification = useNotificationStore((s) => s.showNotification)
  const navigate = useNavigate()

  const login = async (username: string, password: string) => {
    await loginStore(username, password) // si falla, el error sube a la página (credenciales incorrectas)
    showNotification(`¡Hola, ${useAuthStore.getState().user?.full_name ?? username}!`, 'success')
  }

  const logout = async () => {
    await logoutStore()
    showNotification('Sesión cerrada', 'info')
    navigate('/login', { replace: true })
  }

  return {
    user,
    status,
    aviso,
    isAuthenticated: status === 'authenticated',
    isAdmin: user?.role === 'admin',
    hasRole,
    login,
    logout,
  }
}