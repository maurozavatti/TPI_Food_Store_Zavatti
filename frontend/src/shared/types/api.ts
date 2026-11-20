// Forma estándar de las respuestas paginadas del backend
export interface PaginatedResponse<T> {
  total: number
  offset: number
  limit: number
  items: T[]
}