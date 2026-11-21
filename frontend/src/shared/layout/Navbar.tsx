import { Link, NavLink } from 'react-router-dom'
import { RoleBadge, useAuth } from '@/features/auth'
import { useCartStore } from '@/store/cartStore'
import { useThemeStore } from '@/store/themeStore'
import Button from '@/shared/ui/Button'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    isActive ? 'bg-white text-primary' : 'text-indigo-100 hover:bg-white/10'
  }`

const linksAdmin = [
  { to: '/admin/resumen', texto: 'Resumen' },
  { to: '/admin/pedidos', texto: 'Pedidos' },
  { to: '/admin/productos', texto: 'Productos' },
  { to: '/admin/categorias', texto: 'Categorías' },
  { to: '/admin/usuarios', texto: 'Usuarios' },
]

const Navbar = () => {
  const { usuario, isAdmin, logout } = useAuth()
  const cantidad = useCartStore((s) => s.cantidadTotal())
  const darkMode = useThemeStore((s) => s.darkMode)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  return (
    <header className="bg-primary shadow-md dark:bg-indigo-950">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link to="/" className="text-xl font-bold text-white">
          🍔 Food Store
        </Link>

        <ul className="flex flex-wrap items-center gap-1">
          <li>
            <NavLink to="/" end className={linkClass}>
              Catálogo
            </NavLink>
          </li>
          <li>
            <NavLink to="/carrito" className={linkClass}>
              Carrito
              {cantidad > 0 && (
                <span className="ml-1 rounded-full bg-amber-300 px-1.5 text-xs font-bold text-amber-900">{cantidad}</span>
              )}
            </NavLink>
          </li>
          {usuario && (
            <li>
              <NavLink to="/mis-pedidos" className={linkClass}>
                Mis pedidos
              </NavLink>
            </li>
          )}
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
            className="rounded-lg px-2 py-1 text-lg text-white transition hover:bg-white/10"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          {usuario ? (
            <>
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-white">{usuario.full_name}</p>
                <RoleBadge role={usuario.role} variant="navbar" />
              </div>
              <Button variant="secondary" size="sm" onClick={logout}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Iniciar sesión
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Registrarse
              </NavLink>
            </>
          )}
        </div>
      </nav>

      {/* Barra del panel: solo para admin (la protección real está en el backend y en ProtectedRoute) */}
      {isAdmin && (
        <div className="bg-indigo-700 dark:bg-indigo-900">
          <ul className="mx-auto flex max-w-6xl flex-wrap items-center gap-1 px-4 py-2">
            <li className="mr-2 text-xs font-semibold uppercase tracking-wide text-indigo-200">Panel admin</li>
            {linksAdmin.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} className={linkClass}>
                  {l.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  )
}

export default Navbar