import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import DataTable from '@/shared/components/DataTable'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import { inputClass } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import { formatoFecha, formatoPrecio } from '@/shared/utils/formato'
import DetallePedido from '../components/DetallePedido'
import { useCambiarEstadoPedido } from '../hooks/useCambiarEstadoPedido'
import { usePedidos } from '../hooks/usePedidos'
import { ESTADOS, TRANSICIONES, type EstadoPedido, type Pedido } from '../types/pedido'

const ETIQUETA_ACCION: Record<EstadoPedido, string> = {
  PENDIENTE: 'Pendiente',
  EN_PREPARACION: 'Preparar',
  ENTREGADO: 'Entregar',
  CANCELADO: 'Cancelar',
}

const AdminPedidosPage = () => {
  const [estado, setEstado] = useState<EstadoPedido | undefined>(undefined)
  const [detalle, setDetalle] = useState<Pedido | null>(null)
  const { pedidos, isLoading, error, refetch } = usePedidos({ skip: 0, limit: 100, estado })
  const cambiarEstado = useCambiarEstadoPedido()

  const handleCambiar = (pedido: Pedido, nuevo: EstadoPedido) => {
    if (nuevo === 'CANCELADO' && !window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devuelve el stock.`)) return
    cambiarEstado.mutate({ id: pedido.id, estado: nuevo })
  }

  const columns: ColumnDef<Pedido>[] = [
    { accessorKey: 'id', header: '#' },
    { accessorKey: 'usuario_id', header: 'Cliente', cell: (info) => `Usuario #${info.getValue() as number}` },
    { accessorKey: 'created_at', header: 'Fecha', cell: (info) => formatoFecha(info.getValue() as string) },
    { accessorKey: 'total', header: 'Total', cell: (info) => formatoPrecio(info.getValue() as number) },
    { accessorKey: 'estado', header: 'Estado', cell: (info) => <BadgeEstado estado={info.getValue() as EstadoPedido} /> },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const pedido = row.original
        return (
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={() => setDetalle(pedido)}>
              Detalle
            </Button>
            {/* Solo los botones de las transiciones válidas (RN-02) */}
            {TRANSICIONES[pedido.estado].map((siguiente) => (
              <Button
                key={siguiente}
                size="sm"
                variant={siguiente === 'CANCELADO' ? 'danger' : 'primary'}
                onClick={() => handleCambiar(pedido, siguiente)}
                disabled={cambiarEstado.isPending}
              >
                {ETIQUETA_ACCION[siguiente]}
              </Button>
            ))}
          </div>
        )
      },
    },
  ]

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Pedidos</h2>
        <select
          value={estado ?? ''}
          onChange={(e) => setEstado(e.target.value ? (e.target.value as EstadoPedido) : undefined)}
          aria-label="Filtrar por estado"
          className={`${inputClass} sm:max-w-xs`}
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <DataTable
        data={pedidos}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        emptyMessage="No hay pedidos con ese filtro."
        searchPlaceholder="Buscar..."
      />

      {detalle && (
        <Modal titulo={`Pedido #${detalle.id} · Usuario #${detalle.usuario_id}`}>
          <DetallePedido pedido={detalle} />
          <div className="mt-4 flex justify-end">
            <Button variant="secondary" onClick={() => setDetalle(null)}>
              Cerrar
            </Button>
          </div>
        </Modal>
      )}
    </section>
  )
}

export default AdminPedidosPage
