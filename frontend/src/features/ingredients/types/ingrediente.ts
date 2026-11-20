export interface Ingrediente {
  id: number
  nombre: string
  descripcion: string
  es_alergeno: boolean
  unidad_medida_id: number
  created_at: string
  updated_at: string
  deleted_at: string | null
}

// Lo que se envía al backend al crear o editar
export interface IngredienteInput {
  nombre: string
  descripcion: string
  es_alergeno: boolean
  unidad_medida_id: number
}