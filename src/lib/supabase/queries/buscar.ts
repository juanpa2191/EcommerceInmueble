import { createClient } from '@/lib/supabase/server'

export type FiltroBusqueda = {
  municipioId?: string
  actividadIds?: string[]
  tipoInmuebleId?: string
  precioMin?: number
  precioMax?: number
  metrosMin?: number
  metrosMax?: number
  q?: string
  page?: number
  limit?: number
}

export type ResultadoBusqueda = {
  predios: PredioResultado[]
  total: number
  filtrosDisponibles: FiltrosDisponibles
}

export type PredioResultado = {
  id: string
  matricula: string
  metros_cuadrados: number
  municipio_nombre: string
  departamento_nombre: string
  tipo_nombre: string
  precio_minimo: number
  precio_maximo: number
  total_empresas: number
  foto_portada: string | null
  lat?: number | null
  lng?: number | null
}

export type FiltrosDisponibles = {
  precio_min: number
  precio_max: number
  metros_min: number
  metros_max: number
  actividades: { id: string; nombre: string; count: number }[]
  tipos: { id: string; nombre: string; count: number }[]
}

export async function buscarPredios(filtros: FiltroBusqueda): Promise<ResultadoBusqueda> {
  const supabase = await createClient()
  const { page = 1, limit = 12 } = filtros
  const offset = (page - 1) * limit

  const EMPTY_FILTERS: FiltrosDisponibles = {
    precio_min: 0,
    precio_max: 0,
    metros_min: 0,
    metros_max: 0,
    actividades: [],
    tipos: [],
  }

  // Query base de predios con ofertas activas
  let query = supabase
    .from('predios')
    .select(
      `
      id,
      matricula,
      metros_cuadrados,
      municipio:municipios(
        id,
        nombre,
        departamento:departamentos(nombre)
      ),
      tipo_inmueble:tipos_inmueble(id, nombre),
      ofertas(
        id,
        precio,
        activo,
        empresa_id,
        oferta_fotos(imagen_url, orden),
        oferta_actividades(actividad_id, actividad:actividades(id, nombre))
      )
    `,
      { count: 'exact' }
    )

  // Filtro por municipio
  if (filtros.municipioId) {
    query = query.eq('municipio_id', filtros.municipioId)
  }

  // Filtro por tipo de inmueble
  if (filtros.tipoInmuebleId) {
    query = query.eq('tipo_inmueble_id', filtros.tipoInmuebleId)
  }

  // Filtro por m²
  if (filtros.metrosMin !== undefined) {
    query = query.gte('metros_cuadrados', filtros.metrosMin)
  }
  if (filtros.metrosMax !== undefined) {
    query = query.lte('metros_cuadrados', filtros.metrosMax)
  }

  // Búsqueda por texto en municipio (ilike)
  if (filtros.q) {
    query = query.ilike('municipios.nombre', `%${filtros.q}%`)
  }

  const {
    data: prediosRawResult,
    error,
    count,
  } = await query.range(offset, offset + limit - 1)

  if (error) {
    console.error('Error en buscarPredios:', error)
    return { predios: [], total: 0, filtrosDisponibles: EMPTY_FILTERS }
  }

  const prediosRaw = (prediosRawResult ?? []) as any[]
  const predios: PredioResultado[] = []

  for (const predio of prediosRaw) {
    const ofertasActivas = ((predio.ofertas ?? []) as any[]).filter((o) => o.activo)
    if (ofertasActivas.length === 0) continue

    // Filtrar por actividades si se especifican
    if (filtros.actividadIds && filtros.actividadIds.length > 0) {
      const actividadesDelPredio = ofertasActivas.flatMap((o: any) =>
        ((o.oferta_actividades ?? []) as any[]).map((oa: any) => oa.actividad_id)
      )
      const tieneTodasActividades = filtros.actividadIds.every((id) =>
        actividadesDelPredio.includes(id)
      )
      if (!tieneTodasActividades) continue
    }

    const precios = ofertasActivas.map((o: any) => o.precio as number)
    const precioMinimo = Math.min(...precios)
    const precioMaximo = Math.max(...precios)

    // Filtro por precio (sobre precio mínimo disponible)
    if (filtros.precioMin !== undefined && precioMinimo < filtros.precioMin) continue
    if (filtros.precioMax !== undefined && precioMinimo > filtros.precioMax) continue

    const ofertaBarata = ofertasActivas.find((o: any) => o.precio === precioMinimo)
    const fotos = ((ofertaBarata?.oferta_fotos ?? []) as any[]).sort(
      (a: any, b: any) => a.orden - b.orden
    )

    predios.push({
      id: predio.id,
      matricula: predio.matricula,
      metros_cuadrados: predio.metros_cuadrados,
      municipio_nombre: (predio.municipio as any)?.nombre ?? '',
      departamento_nombre: (predio.municipio as any)?.departamento?.nombre ?? '',
      tipo_nombre: (predio.tipo_inmueble as any)?.nombre ?? '',
      precio_minimo: precioMinimo,
      precio_maximo: precioMaximo,
      total_empresas: ofertasActivas.length,
      foto_portada: fotos[0]?.imagen_url ?? null,
    })
  }

  const filtrosDisponibles = calcularFiltrosDisponibles(predios, prediosRaw)

  return { predios, total: count ?? 0, filtrosDisponibles }
}

function calcularFiltrosDisponibles(
  predios: PredioResultado[],
  rawData: any[]
): FiltrosDisponibles {
  if (predios.length === 0) {
    return {
      precio_min: 0,
      precio_max: 0,
      metros_min: 0,
      metros_max: 0,
      actividades: [],
      tipos: [],
    }
  }

  const precios = predios.map((p) => p.precio_minimo)
  const metros = predios.map((p) => p.metros_cuadrados)

  const actividadCount = new Map<string, { nombre: string; count: number }>()
  const tipoCount = new Map<string, { nombre: string; count: number }>()

  for (const predio of rawData) {
    // Tipos
    const tipo = predio.tipo_inmueble
    if (tipo) {
      const existing = tipoCount.get(tipo.id)
      tipoCount.set(tipo.id, { nombre: tipo.nombre, count: (existing?.count ?? 0) + 1 })
    }

    // Actividades de todas las ofertas activas
    for (const oferta of ((predio.ofertas ?? []) as any[]).filter((o: any) => o.activo)) {
      for (const oa of (oferta.oferta_actividades ?? []) as any[]) {
        const nombre = oa.actividad?.nombre ?? oa.actividad_id
        const existing = actividadCount.get(oa.actividad_id)
        if (existing) {
          actividadCount.set(oa.actividad_id, { ...existing, count: existing.count + 1 })
        } else {
          actividadCount.set(oa.actividad_id, { nombre, count: 1 })
        }
      }
    }
  }

  const actividades = Array.from(actividadCount.entries()).map(([id, data]) => ({
    id,
    nombre: data.nombre,
    count: data.count,
  }))

  const tipos = Array.from(tipoCount.entries()).map(([id, data]) => ({
    id,
    nombre: data.nombre,
    count: data.count,
  }))

  return {
    precio_min: Math.min(...precios),
    precio_max: Math.max(...precios),
    metros_min: Math.min(...metros),
    metros_max: Math.max(...metros),
    actividades,
    tipos,
  }
}
