/**
 * Formatea un número como precio colombiano
 * Ejemplo: 250000000 → "$250.000.000"
 */
export function formatPrecio(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(valor)
}

/**
 * Genera el link de WhatsApp con mensaje pre-cargado
 */
export function formatWhatsAppLink({
  telefono,
  nombreInmueble,
  municipio,
  departamento,
  metros,
  precio,
}: {
  telefono: string
  nombreInmueble: string
  municipio: string
  departamento: string
  metros: number
  precio: number
}): string {
  const numero = telefono.replace(/\D/g, '')
  const numeroCompleto = numero.startsWith('57') ? numero : `57${numero}`
  const mensaje = encodeURIComponent(
    `Hola, me interesa el inmueble *${nombreInmueble}* en ${municipio}, ${departamento}. Vi que tiene ${metros} m² a ${formatPrecio(precio)}. ¿Podría darme más información?`
  )
  return `https://wa.me/${numeroCompleto}?text=${mensaje}`
}

/**
 * Formatea metros cuadrados
 * Ejemplo: 250.5 → "250.5 m²"
 */
export function formatMetros(metros: number): string {
  return `${metros % 1 === 0 ? metros.toFixed(0) : metros.toFixed(1)} m²`
}

/**
 * Valida formato de teléfono colombiano
 * Debe tener 10 dígitos y empezar por 3
 */
export function validarTelefonoColombia(telefono: string): boolean {
  const limpio = telefono.replace(/\D/g, '')
  return limpio.length === 10 && limpio.startsWith('3')
}
