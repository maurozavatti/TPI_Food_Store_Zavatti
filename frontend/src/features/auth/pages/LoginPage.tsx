import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { Link, Navigate, useLocation } from 'react-router-dom'
import Button from '@/shared/ui/Button'
import ErrorBanner from '@/shared/ui/ErrorBanner'
import FieldInfo from '@/shared/ui/FieldInfo'
import { inputClass, labelClass } from '@/shared/ui/Input'
import { useAuth } from '../hooks/useAuth'
import type { LoginInput } from '../types/auth'

// Lo que pueden mandar otras páginas al redirigir acá
interface LoginLocationState {
  from?: string // ProtectedRoute: la página que se quería ver
  registrado?: string // RegisterPage: el usuario recién creado
}

const LoginPage = () => {
  const { usuario, login, aviso } = useAuth()
  const location = useLocation()
  const state = (location.state ?? {}) as LoginLocationState
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: { username: state.registrado ?? '', password: '' } as LoginInput,
    onSubmit: async ({ value }) => {
      setError(null)
      try {
        await login(value.username.trim(), value.password)
        // No hace falta navegar: al cambiar `user`, el <Navigate> de abajo redirige
      } catch (e) {
        setError((e as Error).message) // ej: "Credenciales incorrectas" (sin recargar la página)
      }
    },
  })

  // Ya hay sesión → a la página que quería ver o a /categories
  if (usuario) return <Navigate to={state.from ?? '/categories'} replace />

  return (
    <section className="mx-auto max-w-sm rounded-xl bg-white dark:bg-slate-800 p-6 shadow-md">
      <h2 className="mb-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Iniciar sesión</h2>
      <p className="mb-5 text-sm text-slate-500 dark:text-slate-400">Ingresá con tu usuario y contraseña.</p>

      {state.registrado && !error && (
        <p className="mb-4 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          Cuenta creada. Ya podés iniciar sesión.
        </p>
      )}
      {aviso && !error && (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{aviso}</p>
      )}
      {error && <ErrorBanner mensaje={error} />}

      <form
        onSubmit={(e) => {
          e.preventDefault()
          form.handleSubmit()
        }}
        className="flex flex-col gap-4"
      >
        <form.Field
          name="username"
          validators={{ onChange: ({ value }) => (!value.trim() ? 'Ingresá tu usuario' : undefined) }}
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
          name="password"
          validators={{ onChange: ({ value }) => (!value ? 'Ingresá tu contraseña' : undefined) }}
        >
          {(field) => (
            <div className="flex flex-col gap-1">
              <label htmlFor={field.name} className={labelClass}>
                Contraseña
              </label>
              <input
                id={field.name}
                type="password"
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className={inputClass}
              />
              <FieldInfo field={field} />
            </div>
          )}
        </form.Field>

        {/* Solo este botón se vuelve a dibujar cuando cambia canSubmit / isSubmitting */}
        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
          {([canSubmit, isSubmitting]) => (
            <Button type="submit" disabled={!canSubmit || isSubmitting}>
              {isSubmitting ? 'Ingresando...' : 'Ingresar'}
            </Button>
          )}
        </form.Subscribe>
      </form>

      <p className="mt-5 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="font-medium text-primary hover:underline">
          Registrate
        </Link>
      </p>
    </section>
  )
}

export default LoginPage
