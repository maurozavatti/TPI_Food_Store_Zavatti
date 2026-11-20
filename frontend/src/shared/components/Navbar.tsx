import { Link, useLocation } from 'react-router-dom'
import { RoleBadge, useAuth } from '@/features/auth'
import { useThemeStore } from '@/store/themeStore'
import Button from './ui/Button'

interface NavbarProps {
  titulo: string
}

const linksPrivados = [
  { to: '/categories', texto: 'Categorías' },
  { to: '/products', texto: 'Productos' },
  { to: '/ingredients', texto: 'Ingredientes' },
]

const linkClass = (activo: boolean) =>
  `rounded-lg px-3 py-1.5 text-sm font-medium transition ${
    activo ? 'bg-white text-primary' : 'text-indigo-100 hover:bg-white/10'
  }`

const Navbar = ({ titulo }: NavbarProps) => {
  const { pathname } = useLocation()
  const { user, isAdmin, logout } = useAuth()
  const darkMode = useThemeStore((s) => s.darkMode)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  const links = isAdmin ? [...linksPrivados, { to: '/admin/users', texto: 'Usuarios' }] : linksPrivados

  // Botón de tema: está siempre visible (con o sin sesión)
  const botonTema = (
    <button
      onClick={toggleTheme}
      aria-label={darkMode ? 'Activar modo claro' : 'Activar modo oscuro'}
      title={darkMode ? 'Modo claro' : 'Modo oscuro'}
      className="rounded-lg px-2 py-1 text-lg text-white transition hover:bg-white/10"
    >
      {darkMode ? '☀️' : '🌙'}
    </button>
  )

  return (
    <header className="bg-primary shadow-md dark:bg-indigo-950">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <h1 className="text-xl font-bold text-white">{titulo}</h1>

        {user ? (
          <>
            <ul className="flex flex-wrap gap-2">
              {links.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass(pathname.startsWith(link.to))}>
                    {link.texto}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3">
              {botonTema}
              <div className="text-right leading-tight">
                <p className="text-sm font-semibold text-white">{user.full_name}</p>
                <RoleBadge role={user.role} variant="navbar" />
              </div>
              <Button variant="secondary" size="sm" onClick={logout}>
                Cerrar sesión
              </Button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <ul className="flex gap-2">
              <li>
                <Link to="/login" className={linkClass(pathname === '/login')}>
                  Iniciar sesión
                </Link>
              </li>
              <li>
                <Link to="/register" className={linkClass(pathname === '/register')}>
                  Registrarse
                </Link>
              </li>
            </ul>
            {botonTema}
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar