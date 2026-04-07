/**
 * Genera URL de imagen con transformaciones de Supabase Storage
 */
export function getImageUrl(
  url: string | null,
  options: {
    width?: number
    height?: number
    quality?: number
    format?: 'origin' | 'webp' | 'avif'
    resize?: 'cover' | 'contain' | 'fill'
  } = {}
): string {
  if (!url) return '/placeholder-inmueble.jpg'

  const {
    width = 800,
    height = 600,
    quality = 80,
    format = 'webp',
    resize = 'cover',
  } = options

  // Si ya es una URL de Supabase Storage, añadir transformaciones
  if (url.includes('supabase') && url.includes('/storage/')) {
    const params = new URLSearchParams({
      width: width.toString(),
      height: height.toString(),
      quality: quality.toString(),
      format,
      resize,
    })
    return `${url}?${params.toString()}`
  }

  return url
}

/**
 * URL para thumbnail de tarjeta (listado)
 */
export function getThumbnailUrl(url: string | null): string {
  return getImageUrl(url, { width: 400, height: 300, quality: 75 })
}

/**
 * URL para imagen full (detalle)
 */
export function getFullImageUrl(url: string | null): string {
  return getImageUrl(url, { width: 1200, height: 800, quality: 90 })
}

/**
 * URL para hero (landing)
 */
export function getHeroImageUrl(url: string | null): string {
  return getImageUrl(url, { width: 600, height: 800, quality: 85 })
}
