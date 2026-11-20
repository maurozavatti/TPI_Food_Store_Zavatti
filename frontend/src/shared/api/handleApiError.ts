import { isAxiosError } from 'axios'

// Error 422 de FastAPI: detail es una lista [{ loc, msg, ... }]
interface ErrorValidacion {
  msg: string
}

/**
 * Traduce cualquier error de Axios a un mensaje para el usuario.
 * esRutaDeAuth: en el login, un 401 significa "credenciales incorrectas" (no "sesión vencida").
 */
export function handleApiError(error: unknown, esRutaDeAuth = false): string {
    if (!isAxiosError(error)) return 'Error inesperado.'
    if (error.code === 'ECONNABORTED') return 'El servidor tardó demasiado en responder.'
    if (!error.response) return 'No se pudo conectar con el servidor.'

    const { status, data } = error.response
    const detail = (data as { detail?: unknown } | undefined)?.detail

    if (status === 401 && !esRutaDeAuth) return 'La sesión venció. Iniciá sesión de nuevo.'
    if (status === 403) return 'Acceso denegado: no tenés permisos para esta acción.'
    if (typeof detail === 'string') return detail // 400, 401 del login, 404, 409: mensaje del backend
    if (Array.isArray(detail)) return (detail as ErrorValidacion[]).map((e) => e.msg).join(' | ') // 422
    if (status >= 500) return 'Error del servidor. Intentá de nuevo más tarde.'
    return 'No se pudo completar la operación.'
}