import Card from '@/shared/ui/Card'

interface TarjetaResumenProps {
  titulo: string
  valor: string | number
  color?: string // clase de Tailwind para el borde izquierdo
}

const TarjetaResumen = ({ titulo, valor, color = 'border-l-primary' }: TarjetaResumenProps) => (
  <Card className={`border-l-4 p-5 ${color}`}>
    <p className="text-sm text-slate-500 dark:text-slate-400">{titulo}</p>
    <p className="mt-1 text-3xl font-bold text-slate-900 dark:text-slate-100">{valor}</p>
  </Card>
)

export default TarjetaResumen
