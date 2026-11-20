import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { useAuth } from '@/features/auth'
import { useCategories } from '@/features/categories'
import { useIngredients, useUnidadesMedida } from '@/features/ingredients'
import DataTable from '@/shared/components/DataTable'
import Button from '@/shared/components/ui/Button'
import ProductoModal from '../components/ProductoModal'
import { useProducts } from '../hooks/useProducts'
import type { Producto, ProductoInput } from '../types/producto'

const formatoPrecio = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })

const ProductsPage = () => {
  const { isAdmin } = useAuth()
  const { productos, total, isLoading, error, refetch, crear, actualizar, eliminar } = useProducts()

  // Opciones para el formulario: hooks de OTRAS features, importados desde su barrel
  // (reusan la caché de las otras páginas porque usan la misma queryKey)
  const { categorias } = useCategories()
  const { ingredientes } = useIngredients()
  const { unidades } = useUnidadesMedida()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [seleccionado, setSeleccionado] = useState<Producto | null>(null)

  // ---------- Handlers ----------
  const abrirParaCrear = () => {
    setSeleccionado(null)
    setIsModalOpen(true)
  }

  const abrirParaEditar = (producto: Producto) => {
    setSeleccionado(producto)
    setIsModalOpen(true)
  }

  const cerrarModal = () => {
    setIsModalOpen(false)
    setSeleccionado(null)
    crear.reset()
    actualizar.reset()
  }

  const handleSubmit = (datos: ProductoInput) => {
    if (seleccionado) {
      actualizar.mutate({ id: seleccionado.id, datos }, { onSuccess: cerrarModal })
    } else {
      crear.mutate(datos, { onSuccess: cerrarModal })
    }
  }

  const handleDelete = (producto: Producto) => {
    if (window.confirm(`¿Eliminar el producto "${producto.nombre}"?`)) {
      eliminar.mutate(producto.id)
    }
  }

  // ---------- Columnas ----------
  const columns: ColumnDef<Producto>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: (info) => <span className="font-semibold">{formatoPrecio.format(info.getValue() as number)}</span>,
    },
    {
      id: 'categorias',
      header: 'Categorías',
      accessorFn: (p) => p.categorias.map((c) => c.nombre).join(', '), // texto para ordenar y buscar
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.categorias.map((c) => (
            <span key={c.id} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-primary">
              {c.nombre}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: 'ingredientes',
      header: 'Ingredientes',
      accessorFn: (p) => p.ingredientes.map((i) => i.nombre).join(', '),
      cell: (info) => (info.getValue() as string) || <span className="text-slate-400">—</span>,
    },
    {
      accessorKey: 'disponible',
      header: 'Estado',
      cell: (info) =>
        info.getValue() ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Disponible</span>
        ) : (
          <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
            No disponible
          </span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="warning" size="sm" onClick={() => abrirParaEditar(row.original)}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  // Sin rol admin, la columna de acciones (Editar / Eliminar) no se muestra
  const columnasVisibles = isAdmin ? columns : columns.filter((c) => c.id !== 'acciones')

  const errorModal = (crear.error ?? actualizar.error)?.message ?? null

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Productos {total !== undefined && <span className="text-base font-normal text-slate-500 dark:text-slate-400">({total})</span>}
        </h2>
        {isAdmin && <Button onClick={abrirParaCrear}>+ Nuevo producto</Button>}
      </div>

      <DataTable
        data={productos}
        columns={columnasVisibles}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        emptyMessage='No hay productos. Creá el primero con "Nuevo producto".'
        searchPlaceholder="Buscar producto..."
      />

      {isModalOpen && (
        <ProductoModal
          producto={seleccionado}
          categorias={categorias}
          ingredientes={ingredientes}
          unidades={unidades}
          error={errorModal}
          guardando={crear.isPending || actualizar.isPending}
          onSubmit={handleSubmit}
          onClose={cerrarModal}
        />
      )}
    </section>
  )
}

export default ProductsPage