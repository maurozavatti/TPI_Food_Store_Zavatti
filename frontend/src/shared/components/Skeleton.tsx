interface SkeletonProps {
  className?: string
}

// Bloque gris animado que ocupa el lugar del contenido mientras carga
const Skeleton = ({ className = 'h-5 w-full' }: SkeletonProps) => (
  <div className={`animate-pulse rounded bg-slate-200 dark:bg-slate-700 ${className}`} aria-hidden />
)

export default Skeleton