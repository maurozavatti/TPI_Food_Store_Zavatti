import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useCartStore } from '@/store/cartStore'
import ErrorBanner from '@/shared/ui/ErrorBanner'
import Card from '@/shared/ui/Card'
import { formatoPrecio } from '@/shared/utils/formato'
import CheckoutForm, { type DatosEntrega } from '../components/CheckoutForm'
import { useCrearPedido } from '../hooks/useCrearPedido'

// Requiere sesión: confirma el carrito como pedido (POST /pedidos)
const CheckoutPage = () => {
  const items = useCartStore((s) => s.items)
  const total = useCartStore((s) => s.total())
  const crearPedido = useCrearPedido()
  const navigate = useNavigate()

  // Sin ítems no hay nada que confirmar (también pasa justo después de confirmar: el carrito se vacía)
  if (items.length === 0 && !crearPedido.isSuccess) return <Navigate to="/carrito" replace />

  const confirmar = (datos: DatosEntrega) => {
    crearPedido.mutate(
      { ...datos, items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })) },
      { onSuccess: () => navigate('/mis-pedidos', { replace: true }) },
    )
  }

  return (
    <section className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1fr_20rem]">
      <Card className="p-6">
        <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">Confirmar pedido</h2>
        {crearPedido.isError && <ErrorBanner mensaje={crearPedido.error.message} />}
        <CheckoutForm enviando={crearPedido.isPending} onSubmit={confirmar} />
      </Card>

      <Card className="h-fit p-5">
        <h3 className="mb-3 font-semibold text-slate-900 dark:text-slate-100">Tu pedido</h3>
        <ul className="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-200">
          {items.map((i) => (
            <li key={i.producto_id} className="flex justify-between gap-2">
              <span>
                {i.cantidad} × {i.nombre}
              </span>
              <span>{formatoPrecio(i.precio_unitario * i.cantidad)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-slate-200 pt-3 font-bold text-slate-900 dark:border-slate-700 dark:text-slate-100">
          <span>Total</span>
          <span>{formatoPrecio(total)}</span>
        </p>
        <Link to="/carrito" className="mt-3 inline-block text-sm text-primary hover:underline">
          ← Modificar carrito
        </Link>
      </Card>
    </section>
  )
}

export default CheckoutPage
