import type { ColumnDef } from '@tanstack/react-table'
import DataTable from '@/shared/components/DataTable'
import Button from '@/shared/components/ui/Button'
import RoleBadge from '../components/RoleBadge'
import { useAuth } from '../hooks/useAuth'
import { useUsers } from '../hooks/useUsers'
import type { Rol, Usuario } from '../types/auth.types'

const AdminUsersPage = () => {
  const { user: yo } = useAuth()
  // Toda la lógica de datos (useQuery / useMutation) está en el hook
  const { usuarios, total, isLoading, error, refetch, activar, desactivar } = useUsers()

  const handleDesactivar = (usuario: Usuario) => {
    if (window.confirm(`¿Desactivar a "${usuario.username}"? No podrá iniciar sesión.`)) {
      desactivar.mutate(usuario.id)
    }
  }

  const columns: ColumnDef<Usuario>[] = [
    { accessorKey: 'username', header: 'Usuario' },
    { accessorKey: 'full_name', header: 'Nombre' },
    { accessorKey: 'email', header: 'Email' },
    {
      accessorKey: 'role',
      header: 'Rol',
      cell: (info) => <RoleBadge role={info.getValue() as Rol} />,
    },
    {
      id: 'estado',
      header: 'Estado',
      accessorFn: (u) => (u.disabled ? 'Desactivado' : 'Activo'),
      cell: ({ row }) =>
        row.original.disabled ? (
          <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800">Desactivado</span>
        ) : (
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">Activo</span>
        ),
    },
    {
      id: 'acciones',
      header: 'Acciones',
      enableSorting: false,
      cell: ({ row }) => {
        const usuario = row.original
        if (usuario.id === yo?.id) return <span className="text-xs text-slate-400">(vos)</span>
        return usuario.disabled ? (
          <Button size="sm" onClick={() => activar.mutate(usuario.id)}>
            Activar
          </Button>
        ) : (
          <Button variant="danger" size="sm" onClick={() => handleDesactivar(usuario)}>
            Desactivar
          </Button>
        )
      },
    },
  ]

  return (
    <section>
      <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
        Usuarios {total !== undefined && <span className="text-base font-normal text-slate-500 dark:text-slate-400">({total})</span>}
      </h2>

      <DataTable
        data={usuarios}
        columns={columns}
        isLoading={isLoading}
        error={error}
        onRetry={() => refetch()}
        emptyMessage="No hay usuarios."
        searchPlaceholder="Buscar usuario..."
      />
    </section>
  )
}

export default AdminUsersPage