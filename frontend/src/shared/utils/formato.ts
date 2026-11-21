const moneda = new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })
const fecha = new Intl.DateTimeFormat('es-AR', { dateStyle: 'short', timeStyle: 'short' })

export const formatoPrecio = (valor: number) => moneda.format(valor)
export const formatoFecha = (iso: string) => fecha.format(new Date(iso))