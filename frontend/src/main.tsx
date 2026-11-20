import { QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { queryClient } from '@/shared/api/queryClient'
import '@/shared/api/setupInterceptors' // registra el interceptor de respuesta (401 / 403) UNA sola vez
import '@/store/themeStore' // aplica el tema guardado antes del primer render
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
)