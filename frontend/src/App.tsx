import { useEffect } from 'react'
import AppRouter from '@/routes/AppRouter'
import Toast from '@/shared/components/Toast'
import { useAuthStore } from '@/store/authStore'

const App = () => {
  const checkSession = useAuthStore((s) => s.checkSession)

  // La ÚNICA llamada dentro de un useEffect: confirmar la sesión con /auth/me al montar la app
  useEffect(() => {
    checkSession()
  }, [checkSession])

  return (
    <>
      <AppRouter />
      <Toast />
    </>
  )
}

export default App