export type Rol = 'user' | 'admin'

// Estado de la sesión: 'checking' mientras se consulta /auth/me al iniciar la app
export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated'

// Lo que el frontend guarda del usuario logueado (AuthStore). NUNCA el token.
export interface UsuarioAuth {
    id: number
    username: string
    full_name: string
    email: string
    role: Rol
}

// Usuario completo, como lo devuelve el backend (UserPublic)
export interface Usuario extends UsuarioAuth {
    disabled: boolean
    created_at: string
}

export interface LoginInput {
    username: string
    password: string
}

export interface RegisterInput {
    username: string
    full_name: string
    email: string
    password: string
}

export interface MensajeResponse {
    mensaje: string
}