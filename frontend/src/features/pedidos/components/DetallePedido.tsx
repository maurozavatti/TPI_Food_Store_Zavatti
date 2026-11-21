import { formatoPrecio } from '@/shared/utils/formato'
import type { Pedido } from '../types/pedido'

// Líneas del pedido (con el nombre y el precio COPIADOS al comprar) y datos de entrega
const DetallePedido = ({ pedido }: { pedido: Pedido }) => (
  <div className="flex flex-col gap-3 text-sm">
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
      <table className="w-full text-left">
        <thead className="bg-slate-50 text-xs uppercase text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
          <tr>
            <th className="px-3 py-2">Producto</th>
            <th className="px-3 py-2 text-right">Precio</th>
            <th className="px-3 py-2 text-right">Cant.</th>
            <th className="px-3 py-2 text-right">Subtotal</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700 dark:divide-slate-700 dark:text-slate-200">
          {pedido.items.map((item) => (
            <tr key={item.producto_id}>
              <td className="px-3 py-2">{item.nombre_producto}</td>
              <td className="px-3 py-2 text-right">{formatoPrecio(item.precio_unitario)}</td>
              <td className="px-3 py-2 text-right">{item.cantidad}</td>
              <td className="px-3 py-2 text-right">{formatoPrecio(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-bold text-slate-900 dark:text-slate-100">
            <td className="px-3 py-2" colSpan={3}>
              Total
            </td>
            <td className="px-3 py-2 text-right">{formatoPrecio(pedido.total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
    <dl className="grid gap-1 text-slate-600 dark:text-slate-300 sm:grid-cols-2">
      <div>
        <dt className="inline font-medium">Entrega: </dt>
        <dd className="inline">{pedido.direccion_entrega}</dd>
      </div>
      <div>
        <dt className="inline font-medium">Pago: </dt>
        <dd className="inline">{pedido.forma_pago === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}</dd>
      </div>
      {pedido.notas && (
        <div className="sm:col-span-2">
          <dt className="inline font-medium">Notas: </dt>
          <dd className="inline">{pedido.notas}</dd>
        </div>
      )}
    </dl>
  </div>
)

export default DetallePedido
