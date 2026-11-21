export type EstadoPedido = 'PENDIENTE' | 'EN_PREPARACION' | 'ENTREGADO' | 'CANCELADO'
export type FormaPago = 'EFECTIVO' | 'TRANSFERENCIA'

export const ESTADOS: EstadoPedido[] = ['PENDIENTE', 'EN_PREPARACION', 'ENTREGADO', 'CANCELADO']

// Mismo mapa que el backend (RN-02): para mostrar solo los botones válidos
export const TRANSICIONES: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ['EN_PREPARACION', 'CANCELADO'],
  EN_PREPARACION: ['ENTREGADO', 'CANCELADO'],
  ENTREGADO: [],
  CANCELADO: [],
}

// DetallePedidoRead
export interface DetallePedido {
  producto_id: number
  nombre_producto: string
  precio_unitario: number
  cantidad: number
  subtotal: number
}

// PedidoRead
export interface Pedido {
  id: number
  usuario_id: number
  estado: EstadoPedido
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
  total: number
  created_at: string
  updated_at: string
  items: DetallePedido[]
}

// PedidoCreate
export interface PedidoCreate {
  items: { producto_id: number; cantidad: number }[]
  forma_pago: FormaPago
  direccion_entrega: string
  notas: string | null
}

export interface PedidosPaginados {
  total: number
  items: Pedido[]
}

export interface FiltrosPedidos {
  skip: number
  limit: number
  estado?: EstadoPedido
}

// ResumenPedidos
export interface ResumenPedidos {
  pendientes: number
  en_preparacion: number
  entregados: number
  cancelados: number
  pedidos_hoy: number
  ingresos_entregados: number
}