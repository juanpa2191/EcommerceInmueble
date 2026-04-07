import { createClient } from '@/lib/supabase/server'

export type DetalleInmueble = {
  id: string
  matricula: string
  metros_cuadrados: number
  municipio_nombre: string
  departamento_nombre: string
  tipo_nombre: string
  destacado: boolean
  ofertas: OfertaDetalle[]
  actividades: ActividadDetalle[]
}

export type OfertaDetalle = {
  id: string
  precio: number
  descripcion: string | null
  empresa_nombre: string
  encargado_nombre: string
  encargado_telefono: string
  fotos: { imagen_url: string; orden: number }[]
}

export type ActividadDetalle = {
  id: string
  nombre: string
  imagen_url: string | null
  tipo: 'interna' | 'entorno'
}

export async function getDetalleInmueble(matricula: string): Promise<DetalleInmueble | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('predios')
    .select(
      `
      id,
      matricula,
      metros_cuadrados,
      destacado,
      municipio:municipios(
        nombre,
        departamento:departamentos(nombre)
      ),
      tipo_inmueble:tipos_inmueble(nombre),
      ofertas(
        id,
        precio,
        descripcion,
        activo,
        empresa:empresas(nombre, encargado_nombre, encargado_telefono),
        oferta_fotos(imagen_url, orden),
        oferta_actividades(
          actividad:actividades(id, nombre, imagen_url, tipo)
        )
      )
    `
    )
    .eq('matricula', matricula)
    .single()

  if (error || !data) return null

  const raw = data as any
  const ofertasActivas = ((raw.ofertas ?? []) as any[]).filter((o: any) => o.activo)

  // Actividades únicas de todas las ofertas activas
  const actividadesMap = new Map<string, ActividadDetalle>()
  for (const oferta of ofertasActivas) {
    for (const oa of (oferta.oferta_actividades ?? []) as any[]) {
      if (oa.actividad && !actividadesMap.has(oa.actividad.id)) {
        actividadesMap.set(oa.actividad.id, oa.actividad as ActividadDetalle)
      }
    }
  }

  return {
    id: raw.id,
    matricula: raw.matricula,
    metros_cuadrados: raw.metros_cuadrados,
    municipio_nombre: raw.municipio?.nombre ?? '',
    departamento_nombre: raw.municipio?.departamento?.nombre ?? '',
    tipo_nombre: raw.tipo_inmueble?.nombre ?? '',
    destacado: raw.destacado,
    ofertas: ofertasActivas.map((o: any) => ({
      id: o.id,
      precio: o.precio,
      descripcion: o.descripcion,
      empresa_nombre: o.empresa?.nombre ?? '',
      encargado_nombre: o.empresa?.encargado_nombre ?? '',
      encargado_telefono: o.empresa?.encargado_telefono ?? '',
      fotos: ((o.oferta_fotos ?? []) as any[]).sort((a: any, b: any) => a.orden - b.orden),
    })),
    actividades: Array.from(actividadesMap.values()),
  }
}
