import type { HTMLAttributes } from 'react'

// Caja con fondo, borde y sombra: base de tarjetas de producto, pedidos y resumen
const Card = ({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) => (
  <div
    className={`rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800 ${className}`}
    {...props}
  />
)

export default Card