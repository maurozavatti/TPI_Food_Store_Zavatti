import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeState {
  darkMode: boolean
  toggleTheme: () => void
}

// Tailwind activa las clases "dark:" cuando <html> tiene la clase "dark" (ver index.css)
const aplicarTema = (darkMode: boolean) => document.documentElement.classList.toggle('dark', darkMode)

// La preferencia de tema SÍ se persiste (no es información sensible)
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleTheme: () => set((s) => ({ darkMode: !s.darkMode })),
    }),
    {
      name: 'theme-storage', // clave en localStorage
      onRehydrateStorage: () => (state) => aplicarTema(state?.darkMode ?? false), // al cargar la página
    },
  ),
)

// Cada vez que cambia darkMode, se actualiza la clase de <html>
useThemeStore.subscribe((state) => aplicarTema(state.darkMode))