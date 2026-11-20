import { QueryClient } from '@tanstack/react-query'
import { isAxiosError } from 'axios'

// Errores 4xx (401, 403, 404, 409, 422) no se arreglan reintentando
const esErrorDelCliente = (error: Error) =>
    isAxiosError(error) && error.response !== undefined && error.response.status < 500

    // Un único QueryClient para toda la app. Está en su propio módulo para poder
    // limpiar la caché desde fuera de React (al cerrar sesión).
    export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
        staleTime: 30_000, // durante 30 s los datos se consideran frescos
        retry: (intentos, error) => !esErrorDelCliente(error) && intentos < 1,
        },
    },
})