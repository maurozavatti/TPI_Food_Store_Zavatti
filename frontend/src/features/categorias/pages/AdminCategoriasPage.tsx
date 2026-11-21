import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import DataTable from '@/shared/components/DataTable'
import Button from '@/shared/ui/Button'
import CategoriaFormModal from '../components/CategoriaFormModal'
import { useCategorias } from '../hooks/useCategorias'
import type { Categoria, CategoriaInput } from '../types/categoria'

// ABM de categorías (solo admin): TanStack Table + TanStack Form en un modal
const AdminCategoriasPage = () => {
  const { categorias, isLoading, error, refetch, crear, actualizar, eliminar } = useCategorias()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [seleccionada, setSeleccionada] = useState<Categoria | null>(null)

  const abrir = (categoria: Categoria | null) => {
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
    if (seleccionada) actualizar.mutate({ id: seleccionada.id, datos }, { onSuccess: cerrarModal })
    else crear.mutate(datos, { onSuccess: cerrarModal })
  }

  const handleDelete = (categoria: Categoria) => {
    if (window.confirm(`¿Dar de baja la categoría "${categoria.nombre}"?`)) eliminar.mutate(categoria.id)
  }

  const columns: ColumnDef<Categoria>[] = [
    { accessorKey: 'id', header: 'ID' },
    { accessorKey: 'nombre', header: 'Nombre' },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: (info) => (info.getValue() as string | null) || <span className="text-slate-400">—</span>,
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="warning" size="sm" onClick={() => abrir(row.original)}>
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
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Categorías</h2>
        <Button onClick={() => abrir(null)}>+ Nueva categoría</Button>
      </div>

      <DataTable
        data={categorias}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        emptyMessage='No hay categorías. Creá la primera con "Nueva categoría".'
        searchPlaceholder="Buscar categoría..."
      />

      {isModalOpen && (
        <CategoriaFormModal
          categoria={seleccionada}
          error={(crear.error ?? actualizar.error)?.message ?? null}
          guardando={crear.isPending || actualizar.isPending}
          onSubmit={handleSubmit}
          onClose={cerrarModal}
        />
      )}
    </section>
  )
}

export default AdminCategoriasPage