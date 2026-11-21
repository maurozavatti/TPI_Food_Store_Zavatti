import { useState } from 'react'
import type { Categoria } from '@/features/categorias'
import Button from '@/shared/ui/Button'
import { inputClass } from '@/shared/ui/Input'

interface FiltrosCatalogoProps {
  categorias: Categoria[]
  categoriaId: number | undefined
  onBuscar: (texto: string) => void
  onCategoria: (id: number | undefined) => void
}

// Búsqueda por nombre (al enviar) y filtro por categoría
const FiltrosCatalogo = ({ categorias, categoriaId, onBuscar, onCategoria }: FiltrosCatalogoProps) => {
  const [texto, setTexto] = useState('')

  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row">
      <form
        className="flex flex-1 gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          onBuscar(texto.trim())
        }}
      >
        <input
          type="search"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value)
            if (e.target.value === '') onBuscar('') // al borrar el texto se vuelve a ver todo
          }}
          placeholder="Buscar por nombre..."
          aria-label="Buscar producto"
          className={inputClass}
        />
        <Button type="submit">Buscar</Button>
      </form>

      <select
        value={categoriaId ?? ''}
        onChange={(e) => onCategoria(e.target.value ? Number(e.target.value) : undefined)}
        aria-label="Filtrar por categoría"
        className={`${inputClass} sm:max-w-xs`}
      >
        <option value="">Todas las categorías</option>
        {categorias.map((c) => (
          <option key={c.id} value={c.id}>
            {c.nombre}
          </option>
        ))}
      </select>
    </div>
  )
}

export default FiltrosCatalogo
