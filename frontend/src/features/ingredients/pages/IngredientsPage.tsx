import type { ColumnDef } from '@tanstack/react-table'
import { useState } from 'react'
import { useAuth } from '@/features/auth'
import DataTable from '@/shared/components/DataTable'
import Button from '@/shared/components/ui/Button'
import IngredienteModal from '../components/IngredienteModal'
import { useIngredients } from '../hooks/useIngredients'
import { useUnidadesMedida } from '../hooks/useUnidadesMedida'
import type { Ingrediente, IngredienteInput } from '../types/ingrediente'

const IngredientsPage = () => {
  const { isAdmin } = useAuth()
  const { ingredientes, total, isLoading, error, refetch, crear, actualizar, eliminar } = useIngredients()
  const { unidades } = useUnidadesMedida()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [seleccionado, setSeleccionado] = useState<Ingrediente | null>(null)

  // ---------- Handlers ----------
  const abrirParaCrear = () => {
    setSeleccionado(null)
    setIsModalOpen(true)
  }

  const abrirParaEditar = (ingrediente: Ingrediente) => {
    setSeleccionado(ingrediente)
    setIsModalOpen(true)
  }

  const cerrarModal = () => {
    setIsModalOpen(false)
    setSeleccionado(null)
    crear.reset()
    actualizar.reset()
  }

  const handleSubmit = (datos: IngredienteInput) => {
    if (seleccionado) {
      actualizar.mutate({ id: seleccionado.id, datos }, { onSuccess: cerrarModal })
    } else {
      crear.mutate(datos, { onSuccess: cerrarModal })
    }
  }

  const handleDelete = (ingrediente: Ingrediente) => {
    if (window.confirm(`¿Eliminar el ingrediente "${ingrediente.nombre}"?`)) {
      eliminar.mutate(ingrediente.id)
    }
  }

  // ---------- Columnas ----------
  const columns: ColumnDef<Ingrediente>[] = [
    { accessorKey: 'nombre', header: 'Nombre' },
    {
      accessorKey: 'descripcion',
      header: 'Descripción',
      cell: (info) => (info.getValue() as string) || <span className="text-slate-400">—</span>,
    },
    {
      id: 'unidad',
      header: 'Unidad',
      // accessorFn: valor calculado (se usa para ordenar y buscar)
      accessorFn: (ing) => unidades.find((u) => u.id === ing.unidad_medida_id)?.nombre ?? '',
      cell: ({ row }) => {
        const u = unidades.find((u) => u.id === row.original.unidad_medida_id)
        return u ? `${u.nombre} (${u.simbolo})` : '—'
      },
    },
    {
      accessorKey: 'es_alergeno',
      header: 'Alérgeno',
      cell: (info) =>
        info.getValue() ? (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Sí</span>
        ) : (
          <span className="text-xs text-slate-400">No</span>
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

  const columnasVisibles = isAdmin ? columns : columns.filter((c) => c.id !== 'acciones')

  const errorModal = (crear.error ?? actualizar.error)?.message ?? null

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Ingredientes {total !== undefined && <span className="text-base font-normal text-slate-500 dark:text-slate-400">({total})</span>}
        </h2>
        {isAdmin && <Button onClick={abrirParaCrear}>+ Nuevo ingrediente</Button>}
      </div>

      <DataTable
        data={ingredientes}
        columns={columnasVisibles}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        emptyMessage='No hay ingredientes. Creá el primero con "Nuevo ingrediente".'
        searchPlaceholder="Buscar ingrediente..."
      />

      {isModalOpen && (
        <IngredienteModal
          ingrediente={seleccionado}
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

export default IngredientsPage