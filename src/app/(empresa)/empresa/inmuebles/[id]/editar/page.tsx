import { createClient } from '@/lib/supabase/server'
import { getOfertaParaEditar } from '@/lib/supabase/queries/empresa'
import { WizardNuevoInmueble } from '@/components/empresa/WizardNuevoInmueble'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarInmublePage({ params }: PageProps) {
  const { id } = await params

  const supabase = await createClient()

  const [oferta, tiposRes, actividadesRes, municipiosRes] = await Promise.all([
    getOfertaParaEditar(id),
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

  if (!oferta) {
    notFound()
  }

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

  const predio = oferta.predio ?? {}
  const actividadesIniciales = (oferta.oferta_actividades ?? []).map(
    (a: any) => a.actividad_id as string
  )
  const fotosIniciales = (oferta.oferta_fotos ?? [])
    .sort((a: any, b: any) => a.orden - b.orden)
    .map((f: any) => f.imagen_url as string)

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#2B2B2B]">Editar oferta</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Modifica los datos de tu oferta. Los datos del predio no pueden
          cambiarse.
        </p>
      </div>

      <WizardNuevoInmueble
        tipos={tipos}
        actividades={actividades}
        municipios={municipios}
        ofertaId={oferta.id}
        defaultValues={{
          matricula: predio.matricula ?? '',
          tipo_inmueble_id: predio.tipo_inmueble_id ?? '',
          metros_cuadrados: predio.metros_cuadrados ?? 0,
          municipio_id: predio.municipio_id ?? '',
          precio: oferta.precio ?? 0,
          descripcion: oferta.descripcion ?? '',
        }}
        actividadesIniciales={actividadesIniciales}
        fotosIniciales={fotosIniciales}
      />
    </div>
  )
}
