import { useState } from 'react'
import { useCategorias } from '@/features/categorias'
import EstadoError from '@/shared/components/EstadoError'
import EstadoVacio from '@/shared/components/EstadoVacio'
import Paginacion from '@/shared/components/Paginacion'
import Skeleton from '@/shared/components/Skeleton'
import Card from '@/shared/ui/Card'
import FiltrosCatalogo from '../components/FiltrosCatalogo'
import ProductoCard from '../components/ProductoCard'
import { useProductos } from '../hooks/useProductos'

const POR_PAGINA = 8

// Catálogo público, paginado en el SERVIDOR: skip = página × limit
const CatalogoPage = () => {
  const [pagina, setPagina] = useState(0)
  const [search, setSearch] = useState('')
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined)

  const { categorias } = useCategorias()
  const { productos, total, isLoading, isFetching, error, refetch } = useProductos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
    search: search || undefined,
    categoria_id: categoriaId,
  })

  // Al cambiar un filtro se vuelve a la primera página
  const buscar = (texto: string) => {
    setSearch(texto)
    setPagina(0)
  }
  const filtrarCategoria = (id: number | undefined) => {
    setCategoriaId(id)
    setPagina(0)
  }

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Catálogo</h2>
        {!isLoading && !error && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {total} producto{total === 1 ? '' : 's'} {isFetching && '· actualizando…'}
          </p>
        )}
      </div>

      <FiltrosCatalogo
        categorias={categorias}
        categoriaId={categoriaId}
        onBuscar={buscar}
        onCategoria={filtrarCategoria}
      />

      {error ? (
        <EstadoError mensaje={`No se pudo cargar el catálogo: ${error.message}`} onReintentar={() => refetch()} />
      ) : isLoading ? (
        // Skeleton: tarjetas grises con la misma forma que las reales
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" role="status" aria-label="Cargando productos">
          {Array.from({ length: POR_PAGINA }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full rounded-none" />
              <div className="flex flex-col gap-2 p-4">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-9 w-full" />
              </div>
            </Card>
          ))}
        </div>
      ) : productos.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          mensaje={search || categoriaId ? 'Probá con otra búsqueda o categoría.' : 'Todavía no hay productos cargados.'}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {productos.map((p) => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>
      )}

      <Paginacion pagina={pagina} totalItems={total} porPagina={POR_PAGINA} onCambiar={setPagina} />
    </section>
  )
}

export default CatalogoPage
