import { createClient } from '@/lib/supabase/server'

export type DashboardMetricas = {
  totalOfertas: number
  ofertasActivas: number
  totalVistas: number
  totalClicksWhatsapp: number
  ofertasRecientes: OfertaResumen[]
  empresa: EmpresaInfo | null
}

export type EmpresaInfo = {
  id: string
  nombre: string
  estado: 'pendiente' | 'aprobada' | 'inactiva'
}

export type OfertaResumen = {
  id: string
  matricula: string
  municipio_nombre: string
  tipo_nombre: string
  precio: number
  activo: boolean
  vistas: number
  clicks_whatsapp: number
  created_at: string
}

export async function getDashboardMetricas(): Promise<DashboardMetricas> {
  const supabase = await createClient()

  // Obtener empresa_id del usuario actual
  const { data: usuarioRaw } = await supabase
    .from('usuarios')
    .select('empresa_id')
    .single()

  const usuario = usuarioRaw as { empresa_id: string | null } | null

  if (!usuario?.empresa_id) {
    return {
      totalOfertas: 0,
      ofertasActivas: 0,
      totalVistas: 0,
      totalClicksWhatsapp: 0,
      ofertasRecientes: [],
      empresa: null,
    }
  }

  const { data: empresaRaw } = await supabase
    .from('empresas')
    .select('id, nombre, estado')
    .eq('id', usuario.empresa_id)
    .single()

  const empresaData = empresaRaw as { id: string; nombre: string; estado: string } | null

  const { data: ofertas } = await supabase
    .from('ofertas')
    .select(`
      id,
      precio,
      activo,
      vistas,
      clicks_whatsapp,
      created_at,
      predio:predios(
        matricula,
        municipio:municipios(nombre),
        tipo_inmueble:tipos_inmueble(nombre)
      )
    `)
    .eq('empresa_id', usuario.empresa_id)
    .order('created_at', { ascending: false })

  const ofertasData = (ofertas ?? []) as any[]
  const empresa = empresaData as EmpresaInfo | null


  return {
    totalOfertas: ofertasData.length,
    ofertasActivas: ofertasData.filter((o) => o.activo).length,
    totalVistas: ofertasData.reduce((sum, o) => sum + (o.vistas ?? 0), 0),
    totalClicksWhatsapp: ofertasData.reduce(
      (sum, o) => sum + (o.clicks_whatsapp ?? 0),
      0
    ),
    ofertasRecientes: ofertasData.slice(0, 5).map((o) => ({
      id: o.id,
      matricula: o.predio?.matricula ?? '',
      municipio_nombre: o.predio?.municipio?.nombre ?? '',
      tipo_nombre: o.predio?.tipo_inmueble?.nombre ?? '',
      precio: o.precio,
      activo: o.activo,
      vistas: o.vistas ?? 0,
      clicks_whatsapp: o.clicks_whatsapp ?? 0,
      created_at: o.created_at,
    })),
    empresa,
  }
}

export async function getMisOfertas(): Promise<OfertaResumen[]> {
  const supabase = await createClient()

  const { data: usuarioRaw } = await supabase
    .from('usuarios')
    .select('empresa_id')
    .single()

  const empresa_id = (usuarioRaw as { empresa_id: string | null } | null)?.empresa_id
  if (!empresa_id) return []

  const { data } = await supabase
    .from('ofertas')
    .select(`
      id,
      precio,
      activo,
      vistas,
      clicks_whatsapp,
      created_at,
      predio:predios(
        matricula,
        municipio:municipios(nombre),
        tipo_inmueble:tipos_inmueble(nombre)
      )
    `)
    .eq('empresa_id', empresa_id)
    .order('created_at', { ascending: false })

  return ((data ?? []) as any[]).map((o) => ({
    id: o.id,
    matricula: o.predio?.matricula ?? '',
    municipio_nombre: o.predio?.municipio?.nombre ?? '',
    tipo_nombre: o.predio?.tipo_inmueble?.nombre ?? '',
    precio: o.precio,
    activo: o.activo,
    vistas: o.vistas ?? 0,
    clicks_whatsapp: o.clicks_whatsapp ?? 0,
    created_at: o.created_at,
  }))
}

export async function getOfertaParaEditar(ofertaId: string) {
  const supabase = await createClient()

  // Obtener empresa_id del usuario — solo puede editar sus propias ofertas
  const { data: usuarioRaw } = await supabase
    .from('usuarios')
    .select('empresa_id')
    .single()

  const empresa_id = (usuarioRaw as { empresa_id: string | null } | null)?.empresa_id
  if (!empresa_id) return null

  const { data } = await supabase
    .from('ofertas')
    .select(`
      id,
      precio,
      descripcion,
      activo,
      predio:predios(
        id,
        matricula,
        metros_cuadrados,
        municipio_id,
        tipo_inmueble_id
      ),
      oferta_fotos(imagen_url, orden),
      oferta_actividades(actividad_id)
    `)
    .eq('id', ofertaId)
    .eq('empresa_id', empresa_id)
    .single()

  return data as any
}
