import type { AnyFieldApi } from '@tanstack/react-form'

// Muestra los errores de un campo de TanStack Form (field.state.meta.errors es un array)
const FieldInfo = ({ field }: { field: AnyFieldApi }) => {
  const { isTouched, errors } = field.state.meta
  if (!isTouched || errors.length === 0) return null
  return (
    <>
      {errors.map((err) => (
        <p key={String(err)} className="mt-1 text-xs text-danger">
          {String(err)}
        </p>
      ))}
    </>
  )
}

export default FieldInfo