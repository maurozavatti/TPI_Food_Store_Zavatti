export interface UnidadMedida {
  id: number
  nombre: string
  simbolo: string
  tipo: string
}

export interface UnidadMedidaListResponse {
  total: number
  items: UnidadMedida[]
}