import type { ReactNode } from 'react'

interface EstadoVacioProps {
  titulo: string
  mensaje?: string
  children?: ReactNode // por ejemplo, un botón o un enlace
}

const EstadoVacio = ({ titulo, mensaje, children }: EstadoVacioProps) => (
  <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center dark:border-slate-600">
    <p className="text-4xl" aria-hidden>
      🍽️
    </p>
    <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{titulo}</h3>
    {mensaje && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{mensaje}</p>}
    {children && <div className="mt-4">{children}</div>}
  </div>
)

export default EstadoVacio