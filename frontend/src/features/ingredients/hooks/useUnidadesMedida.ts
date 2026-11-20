import { useQuery } from '@tanstack/react-query'
import { getUnidadesMedida } from '../services/unidadesService'
import type { UnidadMedida } from '../types/unidadMedida'

const SIN_DATOS: UnidadMedida[] = []

// Catálogo fijo (g, kg, mL...): no cambia nunca, se cachea para siempre.
// Lo usan los ingredientes y también los productos (a través del barrel).
export const useUnidadesMedida = () => {
  const query = useQuery({ queryKey: ['unidades-medida'], queryFn: getUnidadesMedida, staleTime: Infinity })
  return { unidades: query.data?.items ?? SIN_DATOS, isLoading: query.isLoading }
}