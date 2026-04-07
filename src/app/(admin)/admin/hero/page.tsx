import { getHeroImagenesAdmin, getActividadesAdmin } from '@/lib/supabase/queries/admin'
import { HeroAdminClient } from '@/components/admin/HeroAdminClient'

export default async function HeroAdminPage() {
  const [heroImagenes, actividades] = await Promise.all([
    getHeroImagenesAdmin(),
    getActividadesAdmin(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2B2B2B]">Hero Images</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Gestiona las imágenes del hero de la página principal (máximo 2 activas)
        </p>
      </div>
      <HeroAdminClient heroImagenes={heroImagenes} actividades={actividades} />
    </div>
  )
}
