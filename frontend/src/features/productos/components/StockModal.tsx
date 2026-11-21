import { useForm } from '@tanstack/react-form'
import Button from '@/shared/ui/Button'
import ErrorBanner from '@/shared/ui/ErrorBanner'
import FieldInfo from '@/shared/ui/FieldInfo'
import { inputClass, labelClass } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Producto, ProductoStockUpdate } from '../types/producto'

interface StockModalProps {
  producto: Producto
  error: string | null
  guardando: boolean
  onSubmit: (datos: ProductoStockUpdate) => void
  onClose: () => void
}

// Cambio rápido de stock y disponibilidad (PATCH /productos/{id}/stock)
const StockModal = ({ producto, error, guardando, onSubmit, onClose }: StockModalProps) => {
  const form = useForm({
    defaultValues: { stock: String(producto.stock), disponible: producto.disponible },
    onSubmit: ({ value }) => onSubmit({ stock: Number(value.stock), disponible: value.disponible }),
  })

  return (
    <Modal titulo={`Stock de "${producto.nombre}"`}>
      {error && <ErrorBanner mensaje={error} />}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="stock"
          validators={{
            onChange: ({ value }) => {
              const n = Number(value)
              if (value.trim() === '' || Number.isNaN(n)) return 'Ingresá un número'
              if (n < 0 || !Number.isInteger(n)) return 'Tiene que ser un entero mayor o igual a 0'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Stock
              </label>
              <input
                id={field.name}
                type="number"
                min={0}
                step={1}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={inputClass}
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>

        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Disponible para la venta
            </label>
          )}
        </form.Field>

        <div className="flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <form.Subscribe selector={(s) => s.canSubmit}>
            {(canSubmit) => (
              <Button type="submit" disabled={!canSubmit || guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </Modal>
  )
}

export default StockModal
