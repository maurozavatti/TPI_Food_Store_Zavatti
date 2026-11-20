export interface Categoria {
  id: number
  nombre: string
  descripcion: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Lo que se envía al backend al crear o editar
export interface CategoriaInput {
  nombre: string
  descripcion: string
}