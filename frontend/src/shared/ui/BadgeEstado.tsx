import type { EstadoPedido } from '@/features/pedidos'

const estilos: Record<EstadoPedido, string> = {
  PENDIENTE: 'bg-amber-100 text-amber-800',
  EN_PREPARACION: 'bg-blue-100 text-blue-800',
  ENTREGADO: 'bg-green-100 text-green-800',
  CANCELADO: 'bg-slate-200 text-slate-600',
}

const textos: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'En preparación',
  ENTREGADO: 'Entregado',
  CANCELADO: 'Cancelado',
}

// Colorea los cuatro estados del pedido
const BadgeEstado = ({ estado }: { estado: EstadoPedido }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${estilos[estado]}`}>
    {textos[estado]}
  </span>
)

export default BadgeEstado
