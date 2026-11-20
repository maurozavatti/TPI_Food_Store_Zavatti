import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table'
import { useState } from 'react'
import Button from './ui/Button'

interface DataTableProps<T> {
  data: T[]
  columns: ColumnDef<T>[]
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  emptyMessage: string
  searchPlaceholder?: string
}

// Tabla genérica (<T>): la usan las 3 páginas. TanStack Table maneja la lógica
// (orden, búsqueda, paginación) y acá ponemos solo el HTML y Tailwind.
function DataTable<T>({
  data,
  columns,
  isLoading,
  error,
  onRetry,
  emptyMessage,
  searchPlaceholder = 'Buscar...',
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(), // ordenar al hacer clic en la cabecera
    getFilteredRowModel: getFilteredRowModel(), // búsqueda global
    getPaginationRowModel: getPaginationRowModel(), // paginación
    sortDescFirst: false, // el primer clic siempre ordena ascendente (▲)
    initialState: { pagination: { pageSize: 5 } },
  })

  // ---------- Estado: ERROR ----------
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-6 text-center">
        <p className="text-sm text-red-800 dark:text-red-200">No se pudieron cargar los datos: {error.message}</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    )
  }

  const filas = table.getRowModel().rows
  const columnasVisibles = table.getVisibleLeafColumns().length

  return (
    <div>
      <input
        type="search"
        value={globalFilter}
        onChange={(e) => setGlobalFilter(e.target.value)}
        placeholder={searchPlaceholder}
        className="mb-4 w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 sm:max-w-xs"
      />

      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-700/50 text-xs uppercase tracking-wide text-slate-600 dark:text-slate-300">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const orden = header.column.getIsSorted() // false | 'asc' | 'desc'
                  return (
                    <th key={header.id} className="px-4 py-3 font-semibold">
                      {header.column.getCanSort() ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="flex items-center gap-1 uppercase hover:text-primary"
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <span aria-hidden>{orden === 'asc' ? '▲' : orden === 'desc' ? '▼' : '↕'}</span>
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {/* ---------- Estado: LOADING (skeleton) ---------- */}
            {isLoading &&
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={columnasVisibles} className="px-4 py-3">
                    <div className="h-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                  </td>
                </tr>
              ))}

            {/* ---------- Estado: EMPTY ---------- */}
            {!isLoading && filas.length === 0 && (
              <tr>
                <td colSpan={columnasVisibles} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">
                  {data.length === 0 ? emptyMessage : `Sin resultados para "${globalFilter}"`}
                </td>
              </tr>
            )}

            {/* ---------- Datos ---------- */}
            {!isLoading &&
              filas.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-top text-slate-700 dark:text-slate-200">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {table.getPageCount() > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
            ← Anterior
          </Button>
          <span className="text-sm text-slate-600 dark:text-slate-300">
            Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
          </span>
          <Button variant="secondary" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
            Siguiente →
          </Button>
        </div>
      )}
    </div>
  )
}

export default DataTable