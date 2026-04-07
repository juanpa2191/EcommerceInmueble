import { Navbar } from '@/components/public/Navbar'
import { HeroSection } from '@/components/public/HeroSection'
import { PropertyCard } from '@/components/public/PropertyCard'
import { ActivitiesSection } from '@/components/public/ActivitiesSection'
import { getHeroImagenes, getPrediosDestacados, getActividadesLanding } from '@/lib/supabase/queries/landing'

export default async function HomePage() {
  const [heroImagenes, prediosDestacados, actividadesLanding] = await Promise.all([
    getHeroImagenes(),
    getPrediosDestacados(12),
    getActividadesLanding(),
  ])

  return (
    <>
      <Navbar />

      {/* Hero Pinterest */}
      <HeroSection imagenes={heroImagenes} />

      {/* Sección 1: Inmuebles Destacados */}
      <section id="destacados" className="bg-white py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-[#1F3A5F] mb-2">Inmuebles destacados</h2>
            <p className="text-[#6B6B6B]">Los mejores inmuebles seleccionados para ti</p>
          </div>

          {prediosDestacados.length === 0 ? (
            <div className="text-center py-20 text-[#6B6B6B]">
              <p className="text-lg">Próximamente inmuebles disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {prediosDestacados.map(predio => (
                <PropertyCard key={predio.id} predio={predio} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sección 2: Actividades */}
      {actividadesLanding.length > 0 && (
        <ActivitiesSection actividades={actividadesLanding} />
      )}
    </>
  )
}
