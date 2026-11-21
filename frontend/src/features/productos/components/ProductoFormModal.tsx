import { useForm } from '@tanstack/react-form'
import type { Categoria } from '@/features/categorias'
import Button from '@/shared/ui/Button'
import ErrorBanner from '@/shared/ui/ErrorBanner'
import FieldInfo from '@/shared/ui/FieldInfo'
import { inputClass, labelClass } from '@/shared/ui/Input'
import Modal from '@/shared/ui/Modal'
import type { Producto, ProductoInput } from '../types/producto'

interface ProductoFormModalProps {
  producto: Producto | null // null = crear
  categorias: Categoria[]
  error: string | null
  guardando: boolean
  onSubmit: (datos: ProductoInput) => void
  onClose: () => void
}

// En el formulario todo es texto o boolean; se convierte a número al enviar
interface ProductoFormValues {
  nombre: string
  descripcion: string
  precio_base: string
  imagen_url: string
  stock: string
  disponible: boolean
  categoria_id: string
}

const ProductoFormModal = ({ producto, categorias, error, guardando, onSubmit, onClose }: ProductoFormModalProps) => {
  const defaultValues: ProductoFormValues = {
    nombre: producto?.nombre ?? '',
    descripcion: producto?.descripcion ?? '',
    precio_base: producto ? String(producto.precio_base) : '',
    imagen_url: producto?.imagen_url ?? '',
    stock: producto ? String(producto.stock) : '0',
    disponible: producto?.disponible ?? true,
    categoria_id: producto ? String(producto.categoria_id) : '',
  }

  const form = useForm({
    defaultValues,
    onSubmit: ({ value }) => {
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim() || null,
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        disponible: value.disponible,
        categoria_id: Number(value.categoria_id),
      })
    },
  })

  const numeroNoNegativo = (value: string, entero: boolean) => {
    if (value.trim() === '') return 'Obligatorio'
    const n = Number(value)
    if (Number.isNaN(n)) return 'Tiene que ser un número'
    if (n < 0) return 'No puede ser negativo'
    if (entero && !Number.isInteger(n)) return 'Tiene que ser un número entero'
    return undefined
  }

  return (
    <Modal titulo={producto ? 'Editar producto' : 'Nuevo producto'}>
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
          validators={{ onChange: ({ value }) => (value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined) }}
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
                className={inputClass}
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>

        <form.Field
          name="categoria_id"
          validators={{ onChange: ({ value }) => (value ? undefined : 'Elegí una categoría') }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Categoría
              </label>
              <select
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={inputClass}
              >
                <option value="">Elegí una…</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>

        <div className="grid grid-cols-2 gap-4">
          <form.Field name="precio_base" validators={{ onChange: ({ value }) => numeroNoNegativo(value, false) }}>
            {(field) => (
              <div className="flex flex-col gap-1">
                <label htmlFor={field.name} className={labelClass}>
                  Precio
                </label>
                <input
                  id={field.name}
                  type="number"
                  min={0}
                  step="0.01"
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                  className={inputClass}
                />
                <FieldInfo field={field} />
              </div>
            )}
          </form.Field>

          <form.Field name="stock" validators={{ onChange: ({ value }) => numeroNoNegativo(value, true) }}>
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
        </div>

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
                className={inputClass}
              />
            </div>
          )}
        </form.Field>

        <form.Field
          name="imagen_url"
          validators={{
            onChange: ({ value }) =>
              value.trim() && !/^https?:\/\//.test(value.trim()) ? 'Tiene que empezar con http:// o https://' : undefined,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                URL de la imagen <span className="font-normal text-slate-400">(opcional)</span>
              </label>
              <input
                id={field.name}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="https://..."
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

        <div className="mt-2 flex justify-end gap-2">
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

export default ProductoFormModal
