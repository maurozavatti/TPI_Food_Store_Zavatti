import { Link } from 'react-router-dom'

const UnauthorizedPage = () => (
  <section className="mx-auto max-w-md rounded-xl bg-white dark:bg-slate-800 p-8 text-center shadow-md">
    <p className="text-5xl font-bold text-danger">403</p>
    <h2 className="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100">Acceso denegado</h2>
    <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Tu usuario no tiene permisos para ver esta página.</p>
    <Link
      to="/categories"
      className="mt-6 inline-block rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-hover"
    >
      Volver al catálogo
    </Link>
  </section>
)

export default UnauthorizedPage