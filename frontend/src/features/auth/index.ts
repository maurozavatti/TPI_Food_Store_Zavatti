// Barrel de la feature auth: lo que pueden importar las demás carpetas
export { default as RoleBadge } from './components/RoleBadge'
export { useAuth } from './hooks/useAuth'
export { useRegister } from './hooks/useRegister'
export { default as LoginPage } from './pages/LoginPage'
export { default as RegisterPage } from './pages/RegisterPage'
export { default as UnauthorizedPage } from './pages/UnauthorizedPage'
export type { LoginInput, RegisterInput, Rol, Usuario, UsuarioAuth } from './types/auth'