import type { Rol } from '../types/auth'

interface RoleBadgeProps {
  role: Rol
  variant?: 'claro' | 'navbar' // "navbar": sobre el fondo de color del encabezado
}

// Etiqueta del rol: se usa en el Navbar y en la tabla de usuarios
const RoleBadge = ({ role, variant = 'claro' }: RoleBadgeProps) => {
  const estilo =
    role === 'admin'
      ? 'bg-amber-300 text-amber-900'
      : variant === 'navbar'
        ? 'bg-white/20 text-white'
        : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${estilo}`}>{role}</span>
}

export default RoleBadge