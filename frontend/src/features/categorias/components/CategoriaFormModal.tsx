import { useForm } from '@tanstack/react-form'
import type { Categoria, CategoriaInput } from '../types/categoria'
import Button from '@/shared/ui/Button'
import ErrorBanner from '@/shared/ui/ErrorBanner'
import FieldInfo from '@/shared/ui/FieldInfo'
import Modal from '@/shared/ui/Modal'
import { inputClass, labelClass } from '@/shared/ui/Input'

interface CategoriaFormModalProps {
  categoria: Categoria | null // null = crear, con datos = editar
  error: string | null // error del backend (ej: 409 nombre duplicado)
  guardando: boolean
  onSubmit: (datos: CategoriaInput) => void
  onClose: () => void
}

const CategoriaFormModal = ({ categoria, error, guardando, onSubmit, onClose }: CategoriaFormModalProps) => {
  const form = useForm({
    // Valores iniciales: vacíos al crear, precargados al editar
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    },
    onSubmit: ({ value }) => {
      const descripcion = value.descripcion.trim()
      onSubmit({ nombre: value.nombre.trim(), descripcion: descripcion || null })
    },
  })

  return (
    <Modal titulo={categoria ? 'Editar categoría' : 'Nueva categoría'}>
      {error && <ErrorBanner mensaje={error} />}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              if (value.trim().length < 2) return 'Mínimo 2 caracteres'
              if (value.trim().length > 100) return 'Máximo 100 caracteres'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Nombre
              </label>
              <input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="Ej: Pizzas"
                className={inputClass}
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>

        <form.Field name="descripcion">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Descripción <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <textarea
                id={field.name}
                rows={3}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
          )}
        </form.Field>

        <div className="mt-2 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default CategoriaFormModal
