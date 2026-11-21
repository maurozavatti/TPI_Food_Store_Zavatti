import Button from '@/shared/ui/Button'

interface EstadoErrorProps {
  mensaje: string
  onReintentar?: () => void
}

const EstadoError = ({ mensaje, onReintentar }: EstadoErrorProps) => (
  <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-800 dark:bg-red-950">
    <p className="text-sm text-red-800 dark:text-red-200">{mensaje}</p>
    {onReintentar && (
      <Button variant="secondary" size="sm" className="mt-3" onClick={onReintentar}>
        Reintentar
      </Button>
    )}
  </div>
)

export default EstadoError