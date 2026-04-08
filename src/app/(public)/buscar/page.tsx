import { Suspense } from 'react'
import { Navbar } from '@/components/public/Navbar'
import { FiltrosBusqueda } from '@/components/public/FiltrosBusqueda'
import { FiltrosMobileSheet } from '@/components/public/FiltrosMobileSheet'
import { ResultadosBusqueda } from '@/components/public/ResultadosBusqueda'
import { PropertyCardSkeletonGrid } from '@/components/public/PropertyCardSkeleton'
import { buscarPredios, type FiltroBusqueda } from '@/lib/supabase/queries/buscar'

export default async function BuscarPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams

  const filtros: FiltroBusqueda = {
    municipioId: typeof params.municipio === 'string' ? params.municipio : undefined,
    q: typeof params.q === 'string' ? params.q : undefined,
    tipoInmuebleId:
      typeof params.tipoInmuebleId === 'string' ? params.tipoInmuebleId : undefined,
    precioMin: params.precioMin ? Number(params.precioMin) : undefined,
    precioMax: params.precioMax ? Number(params.precioMax) : undefined,
    metrosMin: params.metrosMin ? Number(params.metrosMin) : undefined,
    metrosMax: params.metrosMax ? Number(params.metrosMax) : undefined,
    actividadIds: Array.isArray(params.actividadIds)
      ? params.actividadIds
      : params.actividadIds
        ? [params.actividadIds]
        : undefined,
    page: params.page ? Number(params.page) : 1,
    limit: 12,
  }

  const resultado = await buscarPredios(filtros)

  // Count active filters for the mobile badge
  const activeFiltersCount = [
    filtros.q,
    filtros.tipoInmuebleId,
    filtros.precioMin,
    filtros.precioMax,
    filtros.metrosMin,
    filtros.metrosMax,
  ].filter(Boolean).length + (filtros.actividadIds?.length ?? 0)

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      <Navbar />

      {/* Top bar */}
      <div className="pt-16">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3 lg:hidden">
          <Suspense>
            <FiltrosMobileSheet
              filtrosDisponibles={resultado.filtrosDisponibles}
              activeFiltersCount={activeFiltersCount}
            />
          </Suspense>
          <p className="text-sm text-[#6B6B6B]">
            <span className="font-semibold text-[#2B2B2B]">{resultado.total}</span>{' '}
            {resultado.total === 1 ? 'inmueble encontrado' : 'inmuebles encontrados'}
          </p>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex gap-6 items-start">
            {/* Sidebar filtros — desktop only */}
            <aside className="hidden lg:block w-[280px] flex-shrink-0 bg-white rounded-xl border border-[#D9D9D9] p-5 sticky top-20">
              <Suspense>
                <FiltrosBusqueda filtrosDisponibles={resultado.filtrosDisponibles} />
              </Suspense>
            </aside>

            {/* Contenido principal */}
            <main className="flex-1 min-w-0">
              {/* Heading (desktop) */}
              <div className="hidden lg:block mb-5">
                <p className="text-sm text-[#6B6B6B]">
                  <span className="font-semibold text-[#2B2B2B]">{resultado.total}</span>{' '}
                  {resultado.total === 1 ? 'inmueble encontrado' : 'inmuebles encontrados'}
                  {filtros.q && (
                    <span className="ml-1">
                      para{' '}
                      <span className="font-medium text-[#2B2B2B]">
                        &ldquo;{filtros.q}&rdquo;
                      </span>
                    </span>
                  )}
                </p>
              </div>

              <Suspense fallback={<PropertyCardSkeletonGrid />}>
                <ResultadosBusqueda predios={resultado.predios} total={resultado.total} />
              </Suspense>

              {/* Placeholder de mapa */}
              <div className="mt-8 rounded-xl border border-[#D9D9D9] bg-[#F5F5F5] h-64 flex items-center justify-center">
                <p className="text-[#6B6B6B]">Mapa disponible próximamente</p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
