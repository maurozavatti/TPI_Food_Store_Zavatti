import Button from '@/shared/ui/Button'

interface PaginacionProps {
  pagina: number // empieza en 0
  totalItems: number
  porPagina: number
  onCambiar: (pagina: number) => void
}

// Paginación del lado del SERVIDOR: la página pide skip = pagina × porPagina
const Paginacion = ({ pagina, totalItems, porPagina, onCambiar }: PaginacionProps) => {
  const totalPaginas = Math.max(1, Math.ceil(totalItems / porPagina))
  if (totalPaginas <= 1) return null

  return (
    <nav className="mt-6 flex items-center justify-center gap-3" aria-label="Paginación">
      <Button variant="secondary" size="sm" onClick={() => onCambiar(pagina - 1)} disabled={pagina === 0}>
        ← Anterior
      </Button>
      <span className="text-sm text-slate-600 dark:text-slate-300">
        Página {pagina + 1} de {totalPaginas}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onCambiar(pagina + 1)}
        disabled={pagina + 1 >= totalPaginas}
      >
        Siguiente →
      </Button>
    </nav>
  )
}

export default Paginacion