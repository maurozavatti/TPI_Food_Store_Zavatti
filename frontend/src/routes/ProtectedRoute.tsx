import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { type Rol, useAuth } from '@/features/auth'

interface ProtectedRouteProps {
  allowedRoles?: Rol[] // si no se pasa, alcanza con tener sesión
}

// Ruta padre: si pasa los controles dibuja la ruta hija con <Outlet />.
// La protección REAL está en el backend (require_role): esto solo evita mostrar pantallas que van a fallar.
const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { usuario, cargando, hasRole } = useAuth()
  const location = useLocation()

  // checkSession todavía no respondió y no hay usuario guardado → indicador de carga
  if (cargando && !usuario) {
    return (
      <div className="flex justify-center py-20" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-primary" />
        <span className="sr-only">Verificando sesión…</span>
      </div>
    )
  }

  if (!usuario) return <Navigate to="/login" replace state={{ from: location.pathname }} />

  if (allowedRoles && !hasRole(allowedRoles)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}

export default ProtectedRoute