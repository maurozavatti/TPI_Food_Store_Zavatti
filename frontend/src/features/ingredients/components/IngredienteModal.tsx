import { useForm } from '@tanstack/react-form'
import type { Ingrediente, IngredienteInput } from '../types/ingrediente'
import type { UnidadMedida } from '../types/unidadMedida'
import Button from '@/shared/components/ui/Button'
import ErrorBanner from '@/shared/components/ui/ErrorBanner'
import FieldInfo from '@/shared/components/ui/FieldInfo'
import Modal from '@/shared/components/ui/Modal'
import { inputClass, labelClass } from '@/shared/components/ui/styles'

interface IngredienteModalProps {
  ingrediente: Ingrediente | null
  unidades: UnidadMedida[]
  error: string | null
  guardando: boolean
  onSubmit: (datos: IngredienteInput) => void
  onClose: () => void
}

const IngredienteModal = ({ ingrediente, unidades, error, guardando, onSubmit, onClose }: IngredienteModalProps) => {
  const form = useForm({
    defaultValues: {
      nombre: ingrediente?.nombre ?? '',
      descripcion: ingrediente?.descripcion ?? '',
      es_alergeno: ingrediente?.es_alergeno ?? false,
      unidad_medida_id: ingrediente?.unidad_medida_id ?? 0, // 0 = "sin elegir"
    } as IngredienteInput,
    onSubmit: ({ value }) => {
      onSubmit({ ...value, nombre: value.nombre.trim(), descripcion: value.descripcion.trim() })
    },
  })

  return (
    <Modal titulo={ingrediente ? 'Editar ingrediente' : 'Nuevo ingrediente'}>
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
            onChange: ({ value }) => (!value.trim() ? 'El nombre es obligatorio' : undefined), // RN-10
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
                placeholder="Ej: Muzzarella"
                className={inputClass}
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="unidad_medida_id"
          validators={{
            onChange: ({ value }) => (value === 0 ? 'Elegí una unidad de medida' : undefined),
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Unidad de medida
              </label>
              <select
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                onBlur={field.handleBlur}
                className={inputClass}
              >
                <option value={0}>Seleccioná...</option>
                {unidades.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre} ({u.simbolo})
                  </option>
                ))}
              </select>
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
                rows={2}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                className={`${inputClass} resize-none`}
              />
            </div>
          )}
        </form.Field>

        <form.Field name="es_alergeno">
          {(field) => (
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Es alérgeno
            </label>
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

export default IngredienteModal
