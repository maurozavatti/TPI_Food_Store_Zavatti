import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { useCategorias } from '@/features/categorias'
import DataTable from '@/shared/components/DataTable'
import Button from '@/shared/ui/Button'
import { formatoPrecio } from '@/shared/utils/formato'
import ProductoFormModal from '../components/ProductoFormModal'
import StockModal from '../components/StockModal'
import { useProductos, useProductosMutations } from '../hooks/useProductos'
import type { Producto, ProductoInput, ProductoStockUpdate } from '../types/producto'

// El panel pide hasta 100 y TanStack Table pagina, ordena y busca del lado del cliente
const FILTROS_ADMIN = { skip: 0, limit: 100 }

type Dialogo = { tipo: 'form'; producto: Producto | null } | { tipo: 'stock'; producto: Producto } | null

const AdminProductosPage = () => {
  const { productos, isLoading, error, refetch } = useProductos(FILTROS_ADMIN)
  const { categorias } = useCategorias()
  const { crear, actualizar, cambiarStock, eliminar } = useProductosMutations()
  const [dialogo, setDialogo] = useState<Dialogo>(null)

  const cerrar = () => {
    setDialogo(null)
    crear.reset()
    actualizar.reset()
    cambiarStock.reset()
  }

  const guardarProducto = (datos: ProductoInput) => {
    if (dialogo?.tipo === 'form' && dialogo.producto) {
      actualizar.mutate({ id: dialogo.producto.id, datos }, { onSuccess: cerrar })
    } else {
      crear.mutate(datos, { onSuccess: cerrar })
    }
  }

  const guardarStock = (datos: ProductoStockUpdate) => {
    if (dialogo?.tipo === 'stock') cambiarStock.mutate({ id: dialogo.producto.id, datos }, { onSuccess: cerrar })
  }

  const handleDelete = (producto: Producto) => {
    if (window.confirm(`¿Dar de baja "${producto.nombre}"?`)) eliminar.mutate(producto.id)
  }

  const columns: ColumnDef<Producto>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    { id: 'categoria', header: 'Categoría', accessorFn: (p) => p.categoria.nombre },
    {
      accessorKey: 'precio_base',
      header: 'Precio',
      cell: (info) => formatoPrecio(info.getValue() as number),
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: (info) => {
        const stock = info.getValue() as number
        return <span className={stock === 0 ? 'font-semibold text-danger' : ''}>{stock}</span>
      },
    },
    {
      accessorKey: 'disponible',
      header: 'Estado',
      cell: (info) =>
        info.getValue() ? (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Disponible</span>
        ) : (
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-600">No disponible</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => setDialogo({ tipo: 'stock', producto: row.original })}>
            Stock
          </Button>
          <Button variant="warning" size="sm" onClick={() => setDialogo({ tipo: 'form', producto: row.original })}>
            Editar
          </Button>
          <Button variant="danger" size="sm" onClick={() => handleDelete(row.original)}>
            Eliminar
          </Button>
        </div>
      ),
    },
  ]

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Productos</h2>
        <Button onClick={() => setDialogo({ tipo: 'form', producto: null })}>+ Nuevo producto</Button>
      </div>

      <DataTable
        data={productos}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        emptyMessage='No hay productos. Creá el primero con "Nuevo producto".'
        searchPlaceholder="Buscar producto..."
      />

      {dialogo?.tipo === 'form' && (
        <ProductoFormModal
          producto={dialogo.producto}
          categorias={categorias}
          error={(crear.error ?? actualizar.error)?.message ?? null}
          guardando={crear.isPending || actualizar.isPending}
          onSubmit={guardarProducto}
          onClose={cerrar}
        />
      )}
      {dialogo?.tipo === 'stock' && (
        <StockModal
          producto={dialogo.producto}
          error={cambiarStock.error?.message ?? null}
          guardando={cambiarStock.isPending}
          onSubmit={guardarStock}
          onClose={cerrar}
        />
      )}
    </section>
  )
}

export default AdminProductosPage
