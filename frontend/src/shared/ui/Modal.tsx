import type { ReactNode } from 'react'

interface ModalProps {
  titulo: string
  children: ReactNode
}

// Solo la "caja": el contenido (el formulario) lo pone quien lo usa
const Modal = ({ titulo, children }: ModalProps) => {
  return (
    <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white dark:bg-slate-800 p-6 shadow-xl"
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{titulo}</h2>
        {children}
      </div>
    </div>
  )
}

export default Modal