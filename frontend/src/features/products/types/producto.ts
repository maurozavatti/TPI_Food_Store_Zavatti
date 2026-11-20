// Versión reducida de categoría que viene dentro de cada producto
export interface CategoriaResumen {
  id: number
  nombre: string
}

// Ingrediente asociado a un producto (con los datos de la tabla intermedia)
export interface ProductoIngrediente {
  id: number
  nombre: string
  es_alergeno: boolean
  unidad_medida_id: number
  cantidad: number
  es_removible: boolean
}

export interface Producto {
  id: number
  nombre: string
  descripcion: string
  precio_base: number
  imagenes_url: string[]
  disponible: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
  categorias: CategoriaResumen[]
  ingredientes: ProductoIngrediente[]
}

// Cómo se envía cada ingrediente al crear o editar un producto
export interface IngredienteEnProducto {
  ingrediente_id: number
  cantidad: number
  es_removible: boolean
}

// Lo que se envía al backend al crear o editar
export interface ProductoInput {
  nombre: string
  descripcion: string
  precio_base: number
  imagenes_url: string[]
  disponible: boolean
  categoria_ids: number[]
  ingredientes: IngredienteEnProducto[]
}