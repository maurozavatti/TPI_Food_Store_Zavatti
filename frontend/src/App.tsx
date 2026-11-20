import { useEffect } from 'react'
import { useAuthStore } from '@/features/auth'
import AppRouter from '@/routes/AppRouter'
import Toast from '@/shared/components/Toast'

// App solo hace 3 cosas: recuperar la sesión al arrancar, dibujar las rutas y el Toast
const App = () => {
  const checkAuth = useAuthStore((s) => s.checkAuth)

  useEffect(() => {
    checkAuth() // GET /auth/me con la cookie HttpOnly
  }, [checkAuth])

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  )
}

export default App