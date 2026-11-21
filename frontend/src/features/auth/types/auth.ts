export type Rol = 'user' | 'admin'

// Lo que el authStore guarda del usuario (NUNCA el token)
export interface UsuarioAuth {
  id: number
  username: string
  full_name: string
  email: string
  role: Rol
}

// UserPublic del backend
export interface Usuario extends UsuarioAuth {
  disabled: boolean
  created_at: string
}

export interface LoginInput {
  username: string
  password: string
}

// UserCreate del backend
export interface RegisterInput {
  username: string
  full_name: string
  email: string
  password: string
}

export interface MensajeResponse {
  message: string
}