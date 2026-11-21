import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ItemCarrito {
  producto_id: number
  nombre: string
  precio_unitario: number
  cantidad: number
  imagen_url: string | null
  stock: number // stock conocido al agregarlo: tope para la cantidad
}

// Lo mínimo que el carrito necesita de un producto
export interface ProductoParaCarrito {
  id: number
  nombre: string
  precio_base: number
  imagen_url: string | null
  stock: number
}

interface CartState {
  items: ItemCarrito[]
  agregar: (producto: ProductoParaCarrito, cantidad?: number) => void
  quitar: (producto_id: number) => void
  cambiarCantidad: (producto_id: number, cantidad: number) => void
  vaciar: () => void
  total: () => number
  cantidadTotal: () => number
}

const limitar = (cantidad: number, stock: number) => Math.max(1, Math.min(cantidad, stock))

// Estado del CLIENTE: el carrito vive en el navegador (persist) hasta confirmar el pedido
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      agregar: (producto, cantidad = 1) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto_id === producto.id)
          if (existente) {
            // ya está: se suma la cantidad (una sola línea por producto, como exige RN-01)
            return {
              items: state.items.map((i) =>
                i.producto_id === producto.id
                  ? { ...i, cantidad: limitar(i.cantidad + cantidad, producto.stock), stock: producto.stock }
                  : i,
              ),
            }
          }
          const nuevo: ItemCarrito = {
            producto_id: producto.id,
            nombre: producto.nombre,
            precio_unitario: producto.precio_base,
            cantidad: limitar(cantidad, producto.stock),
            imagen_url: producto.imagen_url,
            stock: producto.stock,
          }
          return { items: [...state.items, nuevo] }
        }),

      quitar: (producto_id) => set((state) => ({ items: state.items.filter((i) => i.producto_id !== producto_id) })),

      cambiarCantidad: (producto_id, cantidad) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.producto_id === producto_id ? { ...i, cantidad: limitar(cantidad, i.stock) } : i,
          ),
        })),

      vaciar: () => set({ items: [] }),

      // Derivados: se calculan a partir de items (no se guardan)
      total: () => get().items.reduce((suma, i) => suma + i.precio_unitario * i.cantidad, 0),
      cantidadTotal: () => get().items.reduce((suma, i) => suma + i.cantidad, 0),
    }),
    { name: 'cart-storage' }, // localStorage: el carrito sobrevive a la recarga
  ),
)