import { Link } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Button from '@/shared/ui/Button'
import Card from '@/shared/ui/Card'
import { formatoPrecio } from '@/shared/utils/formato'
import LineaCarrito from '../components/LineaCarrito'

// Público: el carrito vive en el navegador (cartStore con persist), no en el servidor
const CarritoPage = () => {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const vaciar = useCartStore((s) => s.vaciar)

  if (items.length === 0) {
    return (
      <EstadoVacio titulo="Tu carrito está vacío" mensaje="Agregá productos desde el catálogo.">
        <Link to="/" className="font-medium text-primary hover:underline">
          Ir al catálogo
        </Link>
      </EstadoVacio>
    )
  }

  return (
    <section className="mx-auto max-w-3xl">
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">Carrito</h2>
      <Card className="px-5">
        <ul className="divide-y divide-slate-100 dark:divide-slate-700">
          {items.map((item) => (
            <LineaCarrito key={item.producto_id} item={item} />
          ))}
        </ul>
      </Card>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <Button variant="secondary" onClick={() => window.confirm('¿Vaciar el carrito?') && vaciar()}>
          Vaciar carrito
        </Button>
        <div className="flex items-center gap-4">
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100">Total: {formatoPrecio(total)}</p>
          <Link
            to="/checkout"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Continuar con la compra
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CarritoPage
