import { useCartStore } from '@/store/cartStore'
import { useNotificationStore } from '@/store/notificationStore'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatoPrecio } from '@/shared/utils/formato'
import type { Producto } from '../types/producto'

// Imagen de respaldo dibujada en SVG (no depende de internet)
const IMAGEN_POR_DEFECTO =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="#e2e8f0"/><text x="200" y="165" font-family="sans-serif" font-size="56" text-anchor="middle">🍽️</text></svg>',
  )

// Tarjeta del catálogo: lee y modifica el cartStore (estado del cliente)
const ProductoCard = ({ producto }: { producto: Producto }) => {
  const agregar = useCartStore((s) => s.agregar)
  const enCarrito = useCartStore((s) => s.items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0)
  const showNotification = useNotificationStore((s) => s.showNotification)

  const sinStock = producto.stock === 0
  const llegoAlTope = enCarrito >= producto.stock
  const sePuedeAgregar = producto.disponible && !sinStock && !llegoAlTope

  const handleAgregar = () => {
    agregar(producto)
    showNotification(`"${producto.nombre}" agregado al carrito`, 'success')
  }

  return (
    <Card className="flex flex-col overflow-hidden">
      <img
        src={producto.imagen_url || IMAGEN_POR_DEFECTO}
        alt={producto.nombre}
        loading="lazy"
        onError={(e) => {
          if (e.currentTarget.src !== IMAGEN_POR_DEFECTO) e.currentTarget.src = IMAGEN_POR_DEFECTO
        }}
        className="aspect-[4/3] w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span className="w-fit rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-primary dark:bg-indigo-950 dark:text-indigo-300">
          {producto.categoria.nombre}
        </span>
        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{producto.nombre}</h3>
        {producto.descripcion && <p className="text-sm text-slate-500 dark:text-slate-400">{producto.descripcion}</p>}

        <div className="mt-auto flex items-end justify-between pt-2">
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100">{formatoPrecio(producto.precio_base)}</p>
          <p className={`text-xs ${sinStock || !producto.disponible ? 'text-danger' : 'text-slate-500 dark:text-slate-400'}`}>
            {!producto.disponible ? 'No disponible' : sinStock ? 'Sin stock' : `Stock: ${producto.stock}`}
          </p>
        </div>

        <Button onClick={handleAgregar} disabled={!sePuedeAgregar}>
          {llegoAlTope && !sinStock ? 'Máximo en el carrito' : 'Agregar al carrito'}
        </Button>
        {enCarrito > 0 && (
          <p className="text-center text-xs text-slate-500 dark:text-slate-400">En el carrito: {enCarrito}</p>
        )}
      </div>
    </Card>
  )
}

export default ProductoCard
