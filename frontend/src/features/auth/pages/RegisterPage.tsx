import { useForm } from '@tanstack/react-form'
import { Link, Navigate } from 'react-router-dom'
import Button from '@/shared/components/ui/Button'
import ErrorBanner from '@/shared/components/ui/ErrorBanner'
import FieldInfo from '@/shared/components/ui/FieldInfo'
import { inputClass, labelClass } from '@/shared/components/ui/styles'
import { useAuth } from '../hooks/useAuth'
import { useRegister } from '../hooks/useRegister'
import type { RegisterInput } from '../types/auth.types'

interface RegisterFormValues extends RegisterInput {
  confirmar: string // solo existe en el formulario, no se envía
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const USERNAME_REGEX = /^[a-zA-Z0-9_.-]+$/

const RegisterPage = () => {
  const { isAuthenticated } = useAuth()
  const registrarMutation = useRegister() // al terminar bien, navega al login

  const form = useForm({
    defaultValues: { username: '', full_name: '', email: '', password: '', confirmar: '' } as RegisterFormValues,
    onSubmit: async ({ value }) => {
      const { confirmar: _confirmar, ...datos } = value // sacamos "confirmar" antes de enviar
      await registrarMutation.mutateAsync({
        ...datos,
        username: datos.username.trim(),
        full_name: datos.full_name.trim(),
        email: datos.email.trim(),
      }).catch(() => undefined) // el error ya queda en registrarMutation.error
    },
  })

  if (isAuthenticated) return <Navigate to="/categories" replace />

  return (
    <section className="mx-auto max-w-md rounded-xl bg-white dark:bg-slate-800 p-6 shadow-md">
      <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Crear cuenta</h2>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">Las cuentas nuevas tienen rol «user» (solo lectura del catálogo).</p>

      {registrarMutation.isError && <ErrorBanner mensaje={registrarMutation.error.message} />}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) => {
              const v = value.trim()
              if (v.length < 3) return 'Mínimo 3 caracteres'
              if (v.length > 50) return 'Máximo 50 caracteres'
              if (!USERNAME_REGEX.test(v)) return 'Solo letras, números y _ . - (sin espacios)'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Usuario
              </label>
              <input
                id={field.name}
                autoComplete="username"
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
          name="full_name"
          validators={{ onChange: ({ value }) => (!value.trim() ? 'El nombre es obligatorio' : undefined) }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Nombre completo
              </label>
              <input
                id={field.name}
                autoComplete="name"
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
          name="email"
          validators={{ onChange: ({ value }) => (!EMAIL_REGEX.test(value.trim()) ? 'Email inválido' : undefined) }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Email
              </label>
              <input
                id={field.name}
                type="email"
                autoComplete="email"
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
          name="password"
          validators={{
            onChange: ({ value }) => {
              if (value.length < 8) return 'Mínimo 8 caracteres'
              if (new TextEncoder().encode(value).length > 72) return 'Máximo 72 bytes'
              return undefined
            },
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Contraseña
              </label>
              <input
                id={field.name}
                type="password"
                autoComplete="new-password"
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
          name="confirmar"
          validators={{
            onChangeListenTo: ['password'], // se revalida también cuando cambia "password"
            onChange: ({ value, fieldApi }) =>
              value !== fieldApi.form.getFieldValue('password') ? 'Las contraseñas no coinciden' : undefined,
          }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Repetir contraseña
              </label>
              <input
                id={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={inputClass}
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>

        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Iniciá sesión
        </Link>
      </p>
    </section>
  )
}

export default RegisterPage
