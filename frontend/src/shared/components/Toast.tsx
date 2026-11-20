import { useEffect } from 'react'
import { useNotificationStore } from '@/store/notificationStore'

const DURACION_MS = 3000

const estilos = {
  success: 'border-green-300 bg-green-50 text-green-900 dark:border-green-700 dark:bg-green-950 dark:text-green-100',
  error: 'border-red-300 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950 dark:text-red-100',
  info: 'border-slate-300 bg-white text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100',
}

const iconos = { success: '✓', error: '✕', info: 'ℹ' }

// Se monta una sola vez en App: lee el notificationStore y se oculta solo a los 3 s
const Toast = () => {
  const { message, show, type, hideNotification } = useNotificationStore()

  useEffect(() => {
    if (!show) return
    const timer = setTimeout(hideNotification, DURACION_MS)
    return () => clearTimeout(timer) // si llega otro mensaje antes, se reinicia el contador
  }, [show, message, hideNotification])

  if (!show) return null

  return (
    <div
      role={type === 'error' ? 'alert' : 'status'}
      className={`fixed right-4 bottom-4 z-50 flex max-w-sm items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-lg ${estilos[type]}`}
    >
      <span className="font-bold">{iconos[type]}</span>
      <p className="flex-1">{message}</p>
      <button onClick={hideNotification} aria-label="Cerrar notificación" className="opacity-60 hover:opacity-100">
        ×
      </button>
    </div>
  )
}

export default Toast