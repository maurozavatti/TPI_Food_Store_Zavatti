import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useCartStore } from '@/store/cartStore'
import { useNotificationStore } from '@/store/notificationStore'

// Puerta de entrada de los componentes a la sesión
export const useAuth = () => {
  const usuario = useAuthStore((s) => s.usuario)
  const cargando = useAuthStore((s) => s.cargando)
  const aviso = useAuthStore((s) => s.aviso)
  const loginStore = useAuthStore((s) => s.login)
  const logoutStore = useAuthStore((s) => s.logout)
  const hasRole = useAuthStore((s) => s.hasRole)
  const vaciarCarrito = useCartStore((s) => s.vaciar)
  const showNotification = useNotificationStore((s) => s.showNotification)
  const navigate = useNavigate()

  const login = async (username: string, password: string) => {
    await loginStore(username, password)
    showNotification(`¡Hola, ${useAuthStore.getState().usuario?.full_name ?? username}!`, 'success')
  }

  const logout = async () => {
    await logoutStore()
    vaciarCarrito() // el carrito es del usuario que se va
    showNotification('Sesión cerrada', 'info')
    navigate('/login', { replace: true })
  }

  return { usuario, cargando, aviso, isAdmin: usuario?.role === 'admin', hasRole, login, logout }
}