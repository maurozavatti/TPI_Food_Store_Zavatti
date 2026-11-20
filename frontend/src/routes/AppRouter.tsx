import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { AdminUsersPage, LoginPage, RegisterPage } from '@/features/auth'
import { CategoriesPage } from '@/features/categories'
import { IngredientsPage } from '@/features/ingredients'
import { ProductsPage } from '@/features/products'
import Navbar from '@/shared/components/Navbar'
import UnauthorizedPage from '@/shared/components/UnauthorizedPage'
import ProtectedRoute from './ProtectedRoute'

// Estructura común a todas las páginas: Navbar arriba y la página actual en <Outlet />
const Layout = () => (
  <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
    <Navbar titulo="Catálogo de Productos" />
    <main className="mx-auto max-w-6xl px-4 py-8">
      <Outlet />
    </main>
  </div>
)

// TODAS las rutas de la app se declaran acá
const AppRouter = () => (
  <Routes>
    <Route element={<Layout />}>
      {/* Públicas */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* Protegidas: cualquier usuario autenticado */}
      <Route element={<ProtectedRoute />}>
        <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/ingredients" element={<IngredientsPage />} />
      </Route>

      {/* Protegidas: solo admin */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/users" element={<AdminUsersPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/categories" replace />} />
      <Route path="*" element={<Navigate to="/categories" replace />} />
    </Route>
  </Routes>
)

export default AppRouter