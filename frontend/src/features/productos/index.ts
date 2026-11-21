// Barrel de la feature productos
export { default as ProductoCard } from './components/ProductoCard'
export { useProductos, useProductosMutations } from './hooks/useProductos'
export { default as AdminProductosPage } from './pages/AdminProductosPage'
export { default as CatalogoPage } from './pages/CatalogoPage'
export type { Producto, ProductoInput, ProductosPaginados } from './types/producto'