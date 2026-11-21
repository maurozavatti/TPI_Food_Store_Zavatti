import axios, { type InternalAxiosRequestConfig } from 'axios'

// Una sola instancia de Axios para toda la app (antes: axiosInstance.ts)
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1',
  timeout: 10_000, // 10 s
  withCredentials: true, // el navegador guarda y envía la cookie HttpOnly (el token)
})

// Interceptor de SOLICITUD: NO maneja el token (viaja solo en la cookie HttpOnly)
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  config.headers.set('Accept-Language', 'es')
  return config
})

// El interceptor de RESPUESTA (401 / 403) está en setupInterceptors.ts:
// así este archivo no importa el authStore y no se forma un import circular
// (authStore → authService → api → authStore).