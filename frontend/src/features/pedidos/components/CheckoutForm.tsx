import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import FieldInfo from '@/shared/ui/FieldInfo'
import { inputClass, labelClass } from '@/shared/ui/Input'
import type { FormaPago } from '../types/pedido'

export interface DatosEntrega {
  direccion_entrega: string
  forma_pago: FormaPago
  notas: string | null
}

interface CheckoutFormProps {
  enviando: boolean
  onSubmit: (datos: DatosEntrega) => void
}

// Formulario de checkout (TanStack Form) con las validaciones de RN-06
const CheckoutForm = ({ enviando, onSubmit }: CheckoutFormProps) => {
  const form = useForm({
    defaultValues: { direccion_entrega: '', forma_pago: 'EFECTIVO' as FormaPago, notas: '' },
    onSubmit: ({ value }) =>
      onSubmit({
        direccion_entrega: value.direccion_entrega.trim(),
        forma_pago: value.forma_pago,
        notas: value.notas.trim() || null,
      }),
  })

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        form.handleSubmit()
      }}
      className="flex flex-col gap-4"
    >
      <form.Field
        name="direccion_entrega"
        validators={{
          onChange: ({ value }) => {
            const largo = value.trim().length
            if (largo < 5) return 'Mínimo 5 caracteres'
            if (largo > 200) return 'Máximo 200 caracteres'
            return undefined
          },
        }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor={field.name} className={labelClass}>
              Dirección de entrega
            </label>
            <input
              id={field.name}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Calle, número, localidad"
              className={inputClass}
            />
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Field name="forma_pago">
        {(field) => (
          <fieldset className="flex flex-col gap-2">
            <legend className={labelClass}>Forma de pago</legend>
            <div className="flex gap-6">
              {(['EFECTIVO', 'TRANSFERENCIA'] as const).map((opcion) => (
                <label key={opcion} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                  <input
                    type="radio"
                    name={field.name}
                    value={opcion}
                    checked={field.state.value === opcion}
                    onChange={() => field.handleChange(opcion)}
                    className="accent-primary"
                  />
                  {opcion === 'EFECTIVO' ? 'Efectivo' : 'Transferencia'}
                </label>
              ))}
            </div>
          </fieldset>
        )}
      </form.Field>

      <form.Field
        name="notas"
        validators={{ onChange: ({ value }) => (value.length > 500 ? 'Máximo 500 caracteres' : undefined) }}
      >
        {(field) => (
          <div className="flex flex-col gap-1">
            <label htmlFor={field.name} className={labelClass}>
              Notas <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              id={field.name}
              rows={2}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="Ej: tocar timbre B"
              className={inputClass}
            />
            <FieldInfo field={field} />
          </div>
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.canSubmit}>
        {(canSubmit) => (
          <Button type="submit" disabled={!canSubmit || enviando}>
            {enviando ? 'Confirmando...' : 'Confirmar pedido'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}

export default CheckoutForm
