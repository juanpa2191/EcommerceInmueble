import { createClient } from '@/lib/supabase/server'
import { WizardNuevoInmueble } from '@/components/empresa/WizardNuevoInmueble'

export default async function NuevoInmueblePage() {
  const supabase = await createClient()

  const [tiposRes, actividadesRes, municipiosRes] = await Promise.all([
    supabase
      .from('tipos_inmueble')
      .select('id, nombre')
      .eq('activo', true),
    supabase
      .from('actividades')
      .select('id, nombre, tipo')
      .eq('activo', true)
      .order('nombre'),
    supabase
      .from('municipios')
      .select('id, nombre, departamento:departamentos(nombre)')
      .order('nombre'),
  ])

  const tipos = (tiposRes.data ?? []) as { id: string; nombre: string }[]
  const actividades = (actividadesRes.data ?? []) as {
    id: string
    nombre: string
    tipo: string
  }[]
  const municipios = (municipiosRes.data ?? []) as {
    id: string
    nombre: string
    departamento: { nombre: string }
  }[]

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2B2B2B]">Nueva oferta</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Completa los 4 pasos para publicar tu inmueble en la plataforma
        </p>
      </div>

      <WizardNuevoInmueble
        tipos={tipos}
        actividades={actividades}
        municipios={municipios}
      />
    </div>
  )
}
