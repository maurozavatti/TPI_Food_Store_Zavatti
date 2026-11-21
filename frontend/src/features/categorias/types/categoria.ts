// CategoriaRead
export interface Categoria {
  id: number
  nombre: string
  descripcion: string | null
  activo: boolean
}

// CategoriaCreate / CategoriaUpdate
export interface CategoriaInput {
  nombre: string
  descripcion: string | null
}