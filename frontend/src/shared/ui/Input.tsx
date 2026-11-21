import type { InputHTMLAttributes } from 'react'

// Clases compartidas por los inputs, selects y textareas de todos los formularios
export const inputClass =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100'

export const labelClass = 'text-sm font-medium text-slate-700 dark:text-slate-200'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

// Input con etiqueta opcional (los formularios de TanStack Form usan las clases directamente)
const Input = ({ label, id, className = '', ...props }: InputProps) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label htmlFor={id} className={labelClass}>
        {label}
      </label>
    )}
    <input id={id} className={`${inputClass} ${className}`} {...props} />
  </div>
)

export default Input