import { create } from 'zustand'

export type TipoNotificacion = 'success' | 'error' | 'info'

interface NotificationState {
  message: string
  show: boolean
  type: TipoNotificacion
  showNotification: (message: string, type?: TipoNotificacion) => void
  hideNotification: () => void
}

// Estado de INTERFAZ global: el mensaje que muestra el <Toast />. Sin persist (es temporal).
export const useNotificationStore = create<NotificationState>()((set) => ({
  message: '',
  show: false,
  type: 'info',
  showNotification: (message, type = 'info') => set({ message, type, show: true }),
  hideNotification: () => set({ show: false }),
}))