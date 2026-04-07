import { createClient } from '@/lib/supabase/server'

// ─── Dashboard ───────────────────────────────────────────────────────────────

export type EmpresaPendiente = {
  id: string
  nombre: string
  nit: string
  correo: string
  encargado_nombre: string
  created_at: string
}

export type AdminDashboardData = {
  totalEmpresas: number
  empresasPendientes: number
  empresasAprobadas: number
  totalPredios: number
  totalOfertas: number
  ofertasActivas: number
  empresasPendientesLista: EmpresaPendiente[]
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const supabase = await createClient()

  const [empresasRes, prediosRes, ofertasRes] = await Promise.all([
    supabase
      .from('empresas')
      .select('id, nombre, nit, correo, encargado_nombre, estado, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('predios').select('id', { count: 'exact', head: true }),
    supabase.from('ofertas').select('id, activo', { count: 'exact' }),
  ])

  const empresas = (empresasRes.data ?? []) as any[]
  const ofertasData = (ofertasRes.data ?? []) as any[]

  return {
    totalEmpresas: empresas.length,
    empresasPendientes: empresas.filter((e) => e.estado === 'pendiente').length,
    empresasAprobadas: empresas.filter((e) => e.estado === 'aprobada').length,
    totalPredios: prediosRes.count ?? 0,
    totalOfertas: ofertasData.length,
    ofertasActivas: ofertasData.filter((o) => o.activo).length,
    empresasPendientesLista: empresas
      .filter((e) => e.estado === 'pendiente')
      .slice(0, 5)
      .map((e) => ({
        id: e.id,
        nombre: e.nombre,
        nit: e.nit,
        correo: e.correo,
        encargado_nombre: e.encargado_nombre,
        created_at: e.created_at,
      })),
  }
}

// ─── Empresas ────────────────────────────────────────────────────────────────

export type EmpresaAdmin = {
  id: string
  nit: string
  nombre: string
  telefono: string
  correo: string
  encargado_nombre: string
  encargado_telefono: string
  estado: 'pendiente' | 'aprobada' | 'inactiva'
  total_ofertas: number
  created_at: string
}

export async function getEmpresasAdmin(): Promise<EmpresaAdmin[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('empresas')
    .select(
      `id, nit, nombre, telefono, correo, encargado_nombre, encargado_telefono, estado, created_at, ofertas(id)`
    )
    .order('created_at', { ascending: false })

  return ((data ?? []) as any[]).map((e) => ({
    id: e.id,
    nit: e.nit,
    nombre: e.nombre,
    telefono: e.telefono,
    correo: e.correo,
    encargado_nombre: e.encargado_nombre,
    encargado_telefono: e.encargado_telefono,
    estado: e.estado,
    total_ofertas: (e.ofertas ?? []).length,
    created_at: e.created_at,
  }))
}

// ─── Actividades ─────────────────────────────────────────────────────────────

export type ActividadAdmin = {
  id: string
  nombre: string
  tipo: 'interna' | 'entorno'
  imagen_url: string | null
  activo: boolean
  mostrar_en_landing: boolean
  orden_landing: number | null
}

export async function getActividadesAdmin(): Promise<ActividadAdmin[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('actividades')
    .select('id, nombre, tipo, imagen_url, activo, mostrar_en_landing, orden_landing')
    .order('nombre')
  return (data ?? []) as ActividadAdmin[]
}

// ─── Hero Imágenes ───────────────────────────────────────────────────────────

export type HeroImagenAdmin = {
  id: string
  imagen_url: string
  actividad_id: string | null
  actividad_nombre: string | null
  activo: boolean
  orden: number
}

export async function getHeroImagenesAdmin(): Promise<HeroImagenAdmin[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('hero_imagenes')
    .select('id, imagen_url, activo, orden, actividad:actividades(id, nombre)')
    .order('orden')
  return ((data ?? []) as any[]).map((h) => ({
    id: h.id,
    imagen_url: h.imagen_url,
    actividad_id: h.actividad?.id ?? null,
    actividad_nombre: h.actividad?.nombre ?? null,
    activo: h.activo,
    orden: h.orden,
  }))
}

// ─── Tipos de Inmueble ────────────────────────────────────────────────────────

export type TipoInmuebleAdmin = {
  id: string
  nombre: string
  activo: boolean
}

export async function getTiposAdmin(): Promise<TipoInmuebleAdmin[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tipos_inmueble')
    .select('id, nombre, activo')
    .order('nombre')
  return (data ?? []) as TipoInmuebleAdmin[]
}

// ─── Geográfico ──────────────────────────────────────────────────────────────

export type DepartamentoConMunicipios = {
  id: string
  nombre: string
  municipios: { id: string; nombre: string }[]
}

export async function getDepartamentosConMunicipios(): Promise<DepartamentoConMunicipios[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('departamentos')
    .select('id, nombre, municipios(id, nombre)')
    .order('nombre')
  return ((data ?? []) as any[]).map((d) => ({
    id: d.id,
    nombre: d.nombre,
    municipios: ((d.municipios ?? []) as any[]).sort((a: any, b: any) =>
      a.nombre.localeCompare(b.nombre)
    ),
  }))
}
