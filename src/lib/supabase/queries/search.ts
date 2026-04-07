import { createClient } from '@/lib/supabase/server'

export type SearchSuggestion = {
  type: 'municipio' | 'departamento' | 'actividad'
  id: string
  label: string
  sublabel?: string
  count?: number
}

/**
 * Autocompletar del buscador — busca municipios, departamentos y actividades
 * que tengan al menos un inmueble activo asociado
 */
export async function getSearchSuggestions(query: string): Promise<SearchSuggestion[]> {
  if (!query || query.length < 2) return []

  const supabase = await createClient()
  const q = query.toLowerCase().trim()

  const [municipiosRes, actividadesRes] = await Promise.all([
    // Municipios con inmuebles activos
    supabase
      .from('municipios')
      .select(`
        id,
        nombre,
        departamento:departamentos(nombre)
      `)
      .ilike('nombre', `%${q}%`)
      .limit(5),

    // Actividades activas
    supabase
      .from('actividades')
      .select('id, nombre')
      .eq('activo', true)
      .ilike('nombre', `%${q}%`)
      .limit(3),
  ])

  const suggestions: SearchSuggestion[] = []

  for (const m of (municipiosRes.data ?? []) as any[]) {
    suggestions.push({
      type: 'municipio',
      id: m.id,
      label: m.nombre,
      sublabel: m.departamento?.nombre,
    })
  }

  for (const a of (actividadesRes.data ?? []) as any[]) {
    suggestions.push({
      type: 'actividad',
      id: a.id,
      label: a.nombre,
    })
  }

  return suggestions
}
