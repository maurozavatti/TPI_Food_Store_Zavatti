import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { type Rol, useAuth } from '@/features/auth'

interface ProtectedRouteProps {
  allowedRoles?: Rol[] // si no se pasa, alcanza con estar logueado
}

// Se usa como "ruta padre": si pasa los controles, dibuja la ruta hija con <Outlet />
const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { status, hasRole } = useAuth()
  const location = useLocation()

  // 1. Todavía se está consultando /auth/me → indicador de carga (no redirigir antes de saber)
  if (status === 'checking') {
    return (
      <div className="flex justify-center py-20" role="status">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-primary" />
        <span className="sr-only">Verificando sesión…</span>
      </div>
    )
  }

  // 2. Sin sesión → login (recordando a dónde quería ir)
  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  // 3. Con sesión pero sin el rol necesario → acceso denegado
  if (allowedRoles && !hasRole(allowedRoles)) {
    return <Navigate to="/unauthorized" replace />
  }

  // 4. Todo OK → se dibuja la ruta hija
  return <Outlet />
}

export default ProtectedRoute