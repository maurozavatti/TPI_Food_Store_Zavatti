import type { ItemCarrito } from '@/store/cartStore'
import { useCartStore } from '@/store/cartStore'
import Button from '@/shared/ui/Button'
import { formatoPrecio } from '@/shared/utils/formato'

// Una fila del carrito: cantidad editable (entre 1 y el stock) y botón para quitar
const LineaCarrito = ({ item }: { item: ItemCarrito }) => {
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad)
  const quitar = useCartStore((s) => s.quitar)

  return (
    <li className="flex flex-wrap items-center gap-4 py-4">
      {item.imagen_url && <img src={item.imagen_url} alt="" className="h-16 w-20 rounded-lg object-cover" />}
      <div className="min-w-40 flex-1">
        <p className="font-medium text-slate-900 dark:text-slate-100">{item.nombre}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{formatoPrecio(item.precio_unitario)} c/u</p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Restar uno de ${item.nombre}`}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
          disabled={item.cantidad <= 1}
        >
          −
        </Button>
        <span className="w-8 text-center font-semibold text-slate-900 dark:text-slate-100">{item.cantidad}</span>
        <Button
          variant="secondary"
          size="sm"
          aria-label={`Sumar uno de ${item.nombre}`}
          onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
          disabled={item.cantidad >= item.stock}
        >
          +
        </Button>
      </div>

      <p className="w-28 text-right font-semibold text-slate-900 dark:text-slate-100">
        {formatoPrecio(item.precio_unitario * item.cantidad)}
      </p>
      <Button variant="danger" size="sm" onClick={() => quitar(item.producto_id)}>
        Quitar
      </Button>
    </li>
  )
}

export default LineaCarrito
