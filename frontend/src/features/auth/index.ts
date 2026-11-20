// Barrel de la feature auth: lo ÚNICO que pueden importar las demás carpetas.
// Desde afuera: import { useAuth } from '@/features/auth'

// Componentes
export { default as RoleBadge } from './components/RoleBadge'

// Hooks
export { useAuth } from './hooks/useAuth'
export { useRegister } from './hooks/useRegister'
export { useUsers } from './hooks/useUsers'

// Store
export { useAuthStore } from './store/authStore'

// Páginas
export { default as AdminUsersPage } from './pages/AdminUsersPage'
export { default as LoginPage } from './pages/LoginPage'
export { default as RegisterPage } from './pages/RegisterPage'

// Tipos
export type { AuthStatus, LoginInput, RegisterInput, Rol, Usuario, UsuarioAuth } from './types/auth.types'