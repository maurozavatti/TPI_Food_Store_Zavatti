import EstadoError from '@/shared/components/EstadoError'
import Skeleton from '@/shared/components/Skeleton'
import { formatoPrecio } from '@/shared/utils/formato'
import TarjetaResumen from '../components/TarjetaResumen'
import { useResumenPedidos } from '../hooks/useResumenPedidos'

const AdminResumenPage = () => {
  const { data, isLoading, error, refetch } = useResumenPedidos()

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Resumen del negocio</h2>

      {error ? (
        <EstadoError mensaje={error.message} onReintentar={() => refetch()} />
      ) : isLoading || !data ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TarjetaResumen titulo="Pedidos de hoy" valor={data.pedidos_hoy} />
          <TarjetaResumen titulo="Ingresos (entregados)" valor={formatoPrecio(data.ingresos_entregados)} color="border-l-success" />
          <TarjetaResumen titulo="Pendientes" valor={data.pendientes} color="border-l-warning" />
          <TarjetaResumen titulo="En preparación" valor={data.en_preparacion} color="border-l-blue-500" />
          <TarjetaResumen titulo="Entregados" valor={data.entregados} color="border-l-success" />
          <TarjetaResumen titulo="Cancelados" valor={data.cancelados} color="border-l-slate-400" />
        </div>
      )}
    </section>
  )
}

export default AdminResumenPage
