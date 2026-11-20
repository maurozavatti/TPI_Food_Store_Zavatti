import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { useAuth } from '@/features/auth'
import DataTable from '@/shared/components/DataTable'
import Button from '@/shared/components/ui/Button'
import CategoriaModal from '../components/CategoriaModal'
import { useCategories } from '../hooks/useCategories'
import type { Categoria, CategoriaInput } from '../types/categoria'

const CategoriesPage = () => {
  // Solo el admin ve los botones de escritura (el backend igual responde 403 a un "user")
  const { isAdmin } = useAuth()
  // Datos y operaciones: todo viene del hook (la página no usa Axios ni TanStack Query)
  const { categorias, total, isLoading, error, refetch, crear, actualizar, eliminar } = useCategories()

  // ---------- Estado de UI ----------
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [seleccionada, setSeleccionada] = useState<Categoria | null>(null)

  // ---------- Handlers ----------
  const abrirParaCrear = () => {
    setSeleccionada(null)
    setIsModalOpen(true)
  }

  const abrirParaEditar = (categoria: Categoria) => {
    setSeleccionada(categoria)
    setIsModalOpen(true)
  }

  const cerrarModal = () => {
    setIsModalOpen(false)
    setSeleccionada(null)
    crear.reset()
    actualizar.reset()
  }

  const handleSubmit = (datos: CategoriaInput) => {
    if (seleccionada) {
      actualizar.mutate({ id: seleccionada.id, datos }, { onSuccess: cerrarModal })
    } else {
      crear.mutate(datos, { onSuccess: cerrarModal })
    }
  }

  const handleDelete = (categoria: Categoria) => {
    if (window.confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
      eliminar.mutate(categoria.id)
    }
  }

  // ---------- Columnas de la tabla (TanStack Table) ----------
  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: (info) => (info.getValue() as string) || <span className="text-slate-400">Sin descripción</span>,
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
          Categorías {total !== undefined && <span className="text-base font-normal text-slate-500 dark:text-slate-400">({total})</span>}
        </h2>
        {isAdmin && <Button onClick={abrirParaCrear}>+ Nueva categoría</Button>}
      </div>

      <DataTable
        data={categorias}
        columns={columnasVisibles}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        emptyMessage='No hay categorías. Creá la primera con "Nueva categoría".'
        searchPlaceholder="Buscar categoría..."
      />

      {isModalOpen && (
        <CategoriaModal
          categoria={seleccionada}
          error={errorModal}
          guardando={crear.isPending || actualizar.isPending}
          onSubmit={handleSubmit}
          onClose={cerrarModal}
        />
      )}
    </section>
  )
}

export default CategoriesPage