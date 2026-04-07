import { createClient } from '@/lib/supabase/server'
import type { Actividad, HeroImagen, Predio, Oferta, OfertaFoto, Municipio, Departamento, TipoInmueble } from '@/types/database.types'

export type HeroImagenConActividad = HeroImagen & {
  actividad: Pick<Actividad, 'id' | 'nombre' | 'tipo'> | null
}

export type PredioDestacadoCard = {
  id: string
  matricula: string
  metros_cuadrados: number
  municipio_nombre: string
  departamento_nombre: string
  tipo_nombre: string
  precio_minimo: number
  total_empresas: number
  foto_portada: string | null
}

export type ActividadLanding = Pick<Actividad, 'id' | 'nombre' | 'imagen_url' | 'tipo' | 'orden_landing'>

/**
 * Obtiene las imágenes activas del hero (máx. 2) con su actividad asociada
 */
export async function getHeroImagenes(): Promise<HeroImagenConActividad[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('hero_imagenes')
    .select(`
      *,
      actividad:actividades(id, nombre, tipo)
    `)
    .eq('activo', true)
    .order('orden', { ascending: true })
    .limit(2)

  if (error) {
    console.error('Error fetching hero imagenes:', error)
    return []
  }

  return (data ?? []) as HeroImagenConActividad[]
}

/**
 * Obtiene los predios destacados para la sección de tarjetas de la landing.
 * Incluye precio mínimo entre todas las empresas que lo publican y foto de portada.
 */
export async function getPrediosDestacados(limit = 12): Promise<PredioDestacadoCard[]> {
  const supabase = await createClient()

  // Obtenemos predios destacados con sus relaciones
  const { data: predios, error } = await supabase
    .from('predios')
    .select(`
      id,
      matricula,
      metros_cuadrados,
      municipio:municipios(
        nombre,
        departamento:departamentos(nombre)
      ),
      tipo_inmueble:tipos_inmueble(nombre),
      ofertas(
        id,
        precio,
        activo,
        empresa_id,
        oferta_fotos(imagen_url, orden)
      )
    `)
    .eq('destacado', true)
    .limit(limit)

  if (error) {
    console.error('Error fetching predios destacados:', error)
    return []
  }

  if (!predios) return []

  return predios
    .map((predio: any) => {
      const ofertasActivas = (predio.ofertas ?? []).filter((o: any) => o.activo)
      if (ofertasActivas.length === 0) return null

      const precioMinimo = Math.min(...ofertasActivas.map((o: any) => o.precio))

      // Foto portada: primera foto (orden=0) de la oferta con precio mínimo
      const ofertaBarata = ofertasActivas.find((o: any) => o.precio === precioMinimo)
      const fotos = (ofertaBarata?.oferta_fotos ?? []).sort((a: any, b: any) => a.orden - b.orden)
      const fotoPportada = fotos[0]?.imagen_url ?? null

      return {
        id: predio.id,
        matricula: predio.matricula,
        metros_cuadrados: predio.metros_cuadrados,
        municipio_nombre: predio.municipio?.nombre ?? '',
        departamento_nombre: (predio.municipio as any)?.departamento?.nombre ?? '',
        tipo_nombre: predio.tipo_inmueble?.nombre ?? '',
        precio_minimo: precioMinimo,
        total_empresas: ofertasActivas.length,
        foto_portada: fotoPportada,
      }
    })
    .filter(Boolean) as PredioDestacadoCard[]
}

/**
 * Obtiene actividades para mostrar en la Sección 2 de la landing
 */
export async function getActividadesLanding(): Promise<ActividadLanding[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('actividades')
    .select('id, nombre, imagen_url, tipo, orden_landing')
    .eq('activo', true)
    .eq('mostrar_en_landing', true)
    .order('orden_landing', { ascending: true, nullsFirst: false })

  if (error) {
    console.error('Error fetching actividades landing:', error)
    return []
  }

  return data ?? []
}
