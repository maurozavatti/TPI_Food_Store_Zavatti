import { useForm } from '@tanstack/react-form'
import type { Categoria, CategoriaInput } from '../types/categoria'
import Button from '@/shared/components/ui/Button'
import ErrorBanner from '@/shared/components/ui/ErrorBanner'
import FieldInfo from '@/shared/components/ui/FieldInfo'
import Modal from '@/shared/components/ui/Modal'
import { inputClass, labelClass } from '@/shared/components/ui/styles'

interface CategoriaModalProps {
  categoria: Categoria | null // null = crear, con datos = editar
  error: string | null // error del backend (ej: 409 nombre duplicado)
  guardando: boolean
  onSubmit: (datos: CategoriaInput) => void
  onClose: () => void
}

const CategoriaModal = ({ categoria, error, guardando, onSubmit, onClose }: CategoriaModalProps) => {
  const form = useForm({
    // Valores iniciales: vacíos al crear, precargados al editar
    defaultValues: {
      nombre: categoria?.nombre ?? '',
      descripcion: categoria?.descripcion ?? '',
    } as CategoriaInput,
    onSubmit: ({ value }) => {
      onSubmit({ nombre: value.nombre.trim(), descripcion: value.descripcion.trim() })
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
              if (!value.trim()) return 'El nombre es obligatorio' // RN-01
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

export default CategoriaModal
