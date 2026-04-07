import { notFound } from 'next/navigation'
import { Navbar } from '@/components/public/Navbar'
import { GaleriaFotos } from '@/components/public/GaleriaFotos'
import { BottomSheetOfertas } from '@/components/public/BottomSheetOfertas'
import { getDetalleInmueble } from '@/lib/supabase/queries/detalle'
import { formatPrecio, formatMetros, formatWhatsAppLink } from '@/lib/utils/format'
import { Separator } from '@/components/ui/separator'
import { Building2, MapPin, Maximize2, Users } from 'lucide-react'
import { WhatsAppButton } from '@/components/public/WhatsAppButton'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ matricula: string }>
}) {
  const { matricula } = await params
  const inmueble = await getDetalleInmueble(matricula)
  if (!inmueble) return {}
  return {
    title: `${inmueble.tipo_nombre} en ${inmueble.municipio_nombre} | ${inmueble.metros_cuadrados}m²`,
    description: inmueble.ofertas[0]?.descripcion ?? undefined,
  }
}

export default async function InmueblePage({
  params,
}: {
  params: Promise<{ matricula: string }>
}) {
  const { matricula } = await params
  const inmueble = await getDetalleInmueble(matricula)

  if (!inmueble) notFound()

  // Collect all unique photos from all offers (deduplicated by imagen_url)
  const fotosMap = new Map<string, { imagen_url: string }>()
  for (const oferta of inmueble.ofertas) {
    for (const foto of oferta.fotos) {
      if (!fotosMap.has(foto.imagen_url)) {
        fotosMap.set(foto.imagen_url, { imagen_url: foto.imagen_url })
      }
    }
  }
  const fotosUnicas = Array.from(fotosMap.values())

  // Sort offers by price ascending
  const ofertasOrdenadas = [...inmueble.ofertas].sort((a, b) => a.precio - b.precio)
  const ofertaPrincipal = ofertasOrdenadas[0]
  const precioMinimo = ofertaPrincipal?.precio ?? 0
  const totalEmpresas = inmueble.ofertas.length
  const tieneMultiplesEmpresas = totalEmpresas > 1

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Offset for fixed navbar */}
      <div className="pt-16">
        {/* Galería */}
        <GaleriaFotos
          fotos={fotosUnicas}
          ofertaPrincipalId={ofertaPrincipal?.id ?? null}
        />

        {/* Contenido principal */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex flex-col gap-8">

            {/* --- Cabecera: tipo, ubicación, superficie --- */}
            <section>
              <div className="flex flex-wrap items-start gap-3 mb-3">
                {/* Badge tipo */}
                <span className="bg-[#1F3A5F] text-white text-sm font-medium px-3 py-1 rounded-full">
                  {inmueble.tipo_nombre}
                </span>

                {/* Badge multi-empresa */}
                {tieneMultiplesEmpresas && (
                  <span className="bg-[#F5F5F5] border border-[#D9D9D9] text-[#2E5C8A] text-sm font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Disponible con {totalEmpresas} empresas
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 text-[#6B6B6B] text-sm mt-2">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#2E5C8A]" />
                  {inmueble.municipio_nombre}, {inmueble.departamento_nombre}
                </span>
                <span className="flex items-center gap-1.5">
                  <Maximize2 className="w-4 h-4 text-[#2E5C8A]" />
                  {formatMetros(inmueble.metros_cuadrados)}
                </span>
              </div>
            </section>

            <Separator />

            {/* --- Precio y CTA --- */}
            <section className="flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
              <div>
                <p className="text-sm text-[#6B6B6B] mb-1">
                  {tieneMultiplesEmpresas ? 'Precio desde' : 'Precio'}
                </p>
                <p className="text-3xl font-bold text-[#1F3A5F]">
                  {tieneMultiplesEmpresas
                    ? `Desde ${formatPrecio(precioMinimo)}`
                    : formatPrecio(precioMinimo)}
                </p>
              </div>

              {tieneMultiplesEmpresas ? (
                <BottomSheetOfertas
                  ofertas={ofertasOrdenadas}
                  inmueble={{
                    tipo_nombre: inmueble.tipo_nombre,
                    municipio_nombre: inmueble.municipio_nombre,
                    departamento_nombre: inmueble.departamento_nombre,
                    metros_cuadrados: inmueble.metros_cuadrados,
                  }}
                />
              ) : ofertaPrincipal ? (
                <WhatsAppButton
                  href={formatWhatsAppLink({
                    telefono: ofertaPrincipal.encargado_telefono,
                    nombreInmueble: inmueble.tipo_nombre,
                    municipio: inmueble.municipio_nombre,
                    departamento: inmueble.departamento_nombre,
                    metros: inmueble.metros_cuadrados,
                    precio: ofertaPrincipal.precio,
                  })}
                  ofertaId={ofertaPrincipal.id}
                />
              ) : null}
            </section>

            {/* --- Empresa (solo si es una) --- */}
            {!tieneMultiplesEmpresas && ofertaPrincipal && (
              <>
                <Separator />
                <section>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F5F5F5] border border-[#D9D9D9] flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-[#2E5C8A]" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#2B2B2B]">
                        {ofertaPrincipal.empresa_nombre}
                      </p>
                      <p className="text-sm text-[#6B6B6B]">
                        Encargado: {ofertaPrincipal.encargado_nombre}
                      </p>
                    </div>
                  </div>
                </section>
              </>
            )}

            {/* --- Actividades disponibles --- */}
            {inmueble.actividades.length > 0 && (
              <>
                <Separator />
                <section>
                  <h2 className="text-lg font-bold text-[#2B2B2B] mb-3">
                    Actividades disponibles
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {inmueble.actividades.map((actividad) => (
                      <span
                        key={actividad.id}
                        className="bg-[#F5F5F5] border border-[#D9D9D9] text-[#2B2B2B] rounded-full px-3 py-1 text-sm"
                      >
                        {actividad.nombre}
                      </span>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* --- Descripción --- */}
            {ofertaPrincipal?.descripcion && (
              <>
                <Separator />
                <section>
                  <h2 className="text-lg font-bold text-[#2B2B2B] mb-3">Descripción</h2>
                  <p className="text-[#6B6B6B] leading-relaxed whitespace-pre-line">
                    {ofertaPrincipal.descripcion}
                  </p>
                </section>
              </>
            )}

            {/* --- Placeholder mapa --- */}
            <Separator />
            <section>
              <h2 className="text-lg font-bold text-[#2B2B2B] mb-3">Ubicación</h2>
              <div className="rounded-xl border border-[#D9D9D9] bg-[#F5F5F5] h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-8 h-8 text-[#D9D9D9] mx-auto mb-2" />
                  <p className="text-[#6B6B6B] text-sm">Mapa disponible próximamente</p>
                </div>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}
