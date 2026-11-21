import { useState } from 'react'
import { Link } from 'react-router-dom'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import Skeleton from '@/shared/components/Skeleton'
import BadgeEstado from '@/shared/ui/BadgeEstado'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatoFecha, formatoPrecio } from '@/shared/utils/formato'
import DetallePedido from '../components/DetallePedido'
import { useCancelarPedido } from '../hooks/useCancelarPedido'
import { usePedidos } from '../hooks/usePedidos'
import type { Pedido } from '../types/pedido'

const POR_PAGINA = 5

const MisPedidosPage = () => {
  const [pagina, setPagina] = useState(0)
  const [abierto, setAbierto] = useState<number | null>(null) // id del pedido con el detalle desplegado
  const { pedidos, total, isLoading, error, refetch } = usePedidos({ skip: pagina * POR_PAGINA, limit: POR_PAGINA })
  const cancelar = useCancelarPedido()

  const handleCancelar = (pedido: Pedido) => {
    if (window.confirm(`¿Cancelar el pedido #${pedido.id}? Se devuelve el stock de los productos.`)) {
      cancelar.mutate(pedido.id)
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Mis pedidos</h2>

      {error ? (
        <EstadoError mensaje={error.message} onReintentar={() => refetch()} />
      ) : isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : pedidos.length === 0 ? (
        <EstadoVacio titulo="Todavía no hiciste pedidos">
          <Link to="/" className="font-medium text-primary hover:underline">
            Ir al catálogo
          </Link>
        </EstadoVacio>
      ) : (
        <ul className="flex flex-col gap-3">
          {pedidos.map((pedido) => (
            <li key={pedido.id}>
              <Card className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">
                      Pedido #{pedido.id} <BadgeEstado estado={pedido.estado} />
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {formatoFecha(pedido.created_at)} · {pedido.items.length} producto(s) · {formatoPrecio(pedido.total)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setAbierto(abierto === pedido.id ? null : pedido.id)}
                      aria-expanded={abierto === pedido.id}
                    >
                      {abierto === pedido.id ? 'Ocultar detalle' : 'Ver detalle'}
                    </Button>
                    {/* RN-04: el cliente solo cancela en PENDIENTE */}
                    {pedido.estado === 'PENDIENTE' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelar(pedido)}
                        disabled={cancelar.isPending}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                </div>
                {abierto === pedido.id && (
                  <div className="mt-4">
                    <DetallePedido pedido={pedido} />
                  </div>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Paginacion pagina={pagina} totalItems={total} porPagina={POR_PAGINA} onCambiar={setPagina} />
    </section>
  )
}

export default MisPedidosPage
