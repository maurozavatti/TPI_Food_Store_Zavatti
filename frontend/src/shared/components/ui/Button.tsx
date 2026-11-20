import type { ButtonHTMLAttributes } from 'react'

type Variante = 'primary' | 'secondary' | 'danger' | 'warning'
type Tamano = 'sm' | 'md'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variante
  size?: Tamano
}

// Un solo lugar para el estilo de todos los botones de la app
const base =
  'inline-flex items-center justify-center rounded-lg font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50'

const variantes: Record<Variante, string> = {
  primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary',
  secondary: 'border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 focus:ring-slate-300',
  danger: 'bg-danger text-white hover:bg-danger-hover focus:ring-danger',
  warning: 'bg-warning text-white hover:bg-warning-hover focus:ring-warning',
}

const tamanos: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
}

const Button = ({ variant = 'primary', size = 'md', className = '', type = 'button', ...props }: ButtonProps) => {
  return <button type={type} className={`${base} ${variantes[variant]} ${tamanos[size]} ${className}`} {...props} />
}

export default Button