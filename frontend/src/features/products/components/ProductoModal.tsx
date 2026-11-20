import { useForm } from '@tanstack/react-form'
import type { Categoria } from '@/features/categories'
import type { Ingrediente, UnidadMedida } from '@/features/ingredients'
import type { IngredienteEnProducto, Producto, ProductoInput } from '../types/producto'
import Button from '@/shared/components/ui/Button'
import ErrorBanner from '@/shared/components/ui/ErrorBanner'
import FieldInfo from '@/shared/components/ui/FieldInfo'
import Modal from '@/shared/components/ui/Modal'
import { inputClass, labelClass } from '@/shared/components/ui/styles'

interface ProductoModalProps {
  producto: Producto | null // null = crear, con datos = editar
  categorias: Categoria[] // opciones para los checkboxes
  ingredientes: Ingrediente[] // opciones para el select de cada fila
  unidades: UnidadMedida[] // para mostrar el símbolo (g, mL...) al lado de la cantidad
  error: string | null
  guardando: boolean
  onSubmit: (datos: ProductoInput) => void
  onClose: () => void
}

// Los valores del formulario: casi igual a ProductoInput, pero las imágenes
// se editan como texto (una URL por línea)
interface ProductoFormValues {
  nombre: string
  descripcion: string
  precio_base: number
  disponible: boolean
  imagenes: string
  categoria_ids: number[]
  ingredientes: IngredienteEnProducto[]
}

const ProductoModal = ({
  producto,
  categorias,
  ingredientes,
  unidades,
  error,
  guardando,
  onSubmit,
  onClose,
}: ProductoModalProps) => {
  const form = useForm({
    defaultValues: {
      nombre: producto?.nombre ?? '',
      descripcion: producto?.descripcion ?? '',
      precio_base: producto?.precio_base ?? 0,
      disponible: producto?.disponible ?? true,
      imagenes: producto?.imagenes_url.join('\n') ?? '',
      categoria_ids: producto?.categorias.map((c) => c.id) ?? [],
      ingredientes:
        producto?.ingredientes.map((i) => ({
          ingrediente_id: i.id,
          cantidad: i.cantidad,
          es_removible: i.es_removible,
        })) ?? [],
    } as ProductoFormValues,
    onSubmit: ({ value }) => {
      onSubmit({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        precio_base: value.precio_base,
        disponible: value.disponible,
        imagenes_url: value.imagenes
          .split('\n')
          .map((url) => url.trim())
          .filter((url) => url !== ''),
        categoria_ids: value.categoria_ids,
        ingredientes: value.ingredientes,
      })
    },
  })

  const simboloDe = (ingredienteId: number) => {
    const ing = ingredientes.find((i) => i.id === ingredienteId)
    return unidades.find((u) => u.id === ing?.unidad_medida_id)?.simbolo ?? ''
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
        {/* ---------- Nombre ---------- */}
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) => {
              if (!value.trim()) return 'El nombre es obligatorio' // RN-06
              if (value.trim().length > 150) return 'Máximo 150 caracteres'
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
                placeholder="Ej: Pizza muzzarella"
                className={inputClass}
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>

        {/* ---------- Precio ---------- */}
        <form.Field
          name="precio_base"
          validators={{
            onChange: ({ value }) =>
              Number.isNaN(value) ? 'Ingresá un número' : value < 0 ? 'El precio no puede ser negativo' : undefined, // RN-07
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Precio base
              </label>
              <input
                id={field.name}
                type="number"
                step="0.01"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))} // el input devuelve texto
                onBlur={field.handleBlur}
                className={inputClass}
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>

        {/* ---------- Descripción ---------- */}
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

        {/* ---------- Categorías (checkboxes) ---------- */}
        <form.Field
          name="categoria_ids"
          validators={{
            onChange: ({ value }) => (value.length === 0 ? 'Elegí al menos una categoría' : undefined),
          }}
        >
          {(field) => (
            <fieldset className="flex flex-col gap-2">
              <legend className={`${labelClass} mb-1`}>Categorías (al menos una)</legend>
              {categorias.length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">Primero creá una categoría en la página Categorías.</p>
              )}
              <div className="grid grid-cols-2 gap-2">
                {categorias.map((cat) => (
                  <label key={cat.id} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={field.state.value.includes(cat.id)}
                      onChange={(e) =>
                        field.handleChange(
                          e.target.checked
                            ? [...field.state.value, cat.id]
                            : field.state.value.filter((id) => id !== cat.id),
                        )
                      }
                      onBlur={field.handleBlur}
                      className="h-4 w-4 accent-primary"
                    />
                    {cat.nombre}
                  </label>
                ))}
              </div>
              <FieldInfo field={field} />
            </fieldset>
          )}
        </form.Field>

        {/* ---------- Ingredientes (campo de tipo ARRAY) ---------- */}
        <form.Field name="ingredientes" mode="array">
          {(field) => (
            <fieldset className="flex flex-col gap-2">
              <legend className={`${labelClass} mb-1`}>
                Ingredientes <span className="font-normal text-slate-400">(opcional)</span>
              </legend>

              {field.state.value.map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  {/* Sub-campo: ingredientes[i].ingrediente_id */}
                  <form.Field
                    name={`ingredientes[${i}].ingrediente_id`}
                    validators={{
                      onChange: ({ value, fieldApi }) => {
                        if (value === 0) return 'Elegí un ingrediente'
                        // fieldApi.form permite leer OTROS campos del formulario
                        const filas = fieldApi.form.getFieldValue('ingredientes')
                        const repetidos = filas.filter((fila) => fila.ingrediente_id === value).length
                        return repetidos > 1 ? 'Ingrediente repetido' : undefined
                      },
                    }}
                  >
                    {(sub) => (
                      <div className="flex-1">
                        <select
                          aria-label={`Ingrediente ${i + 1}`}
                          value={sub.state.value}
                          onChange={(e) => sub.handleChange(Number(e.target.value))}
                          onBlur={sub.handleBlur}
                          className={inputClass}
                        >
                          <option value={0}>Seleccioná...</option>
                          {ingredientes.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.nombre}
                            </option>
                          ))}
                        </select>
                        <FieldInfo field={sub} />
                      </div>
                    )}
                  </form.Field>

                  {/* Sub-campo: ingredientes[i].cantidad */}
                  <form.Field
                    name={`ingredientes[${i}].cantidad`}
                    validators={{ onChange: ({ value }) => (value > 0 ? undefined : 'Cantidad > 0') }}
                  >
                    {(sub) => (
                      <div className="w-32">
                        <div className="flex items-center gap-1">
                          <input
                            aria-label={`Cantidad ${i + 1}`}
                            type="number"
                            step="any"
                            value={sub.state.value}
                            onChange={(e) => sub.handleChange(Number(e.target.value))}
                            onBlur={sub.handleBlur}
                            className={inputClass}
                          />
                          <span className="w-8 text-xs text-slate-500 dark:text-slate-400">
                            {simboloDe(field.state.value[i]?.ingrediente_id)}
                          </span>
                        </div>
                        <FieldInfo field={sub} />
                      </div>
                    )}
                  </form.Field>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-1"
                    aria-label={`Quitar ingrediente ${i + 1}`}
                    onClick={() => field.removeValue(i)}
                  >
                    ✕
                  </Button>
                </div>
              ))}

              <div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => field.pushValue({ ingrediente_id: 0, cantidad: 1, es_removible: true })}
                  disabled={ingredientes.length === 0}
                >
                  + Agregar ingrediente
                </Button>
              </div>
            </fieldset>
          )}
        </form.Field>

        {/* ---------- Imágenes ---------- */}
        <form.Field name="imagenes">
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Imágenes <span className="font-normal text-slate-400">(una URL por línea)</span>
              </label>
              <textarea
                id={field.name}
                rows={2}
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="https://..."
                className={`${inputClass} resize-none`}
              />
            </div>
          )}
        </form.Field>

        {/* ---------- Disponible ---------- */}
        <form.Field name="disponible">
          {(field) => (
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={field.state.value}
                onChange={(e) => field.handleChange(e.target.checked)}
                className="h-4 w-4 accent-primary"
              />
              Disponible
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

export default ProductoModal
