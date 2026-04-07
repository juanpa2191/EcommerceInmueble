'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { HeroImagenConActividad } from '@/lib/supabase/queries/landing'

type Props = {
  imagenes: HeroImagenConActividad[]
}

// Imágenes placeholder cuando no hay datos en la BD
const PLACEHOLDER_CARDS = [
  { label: 'Senderismo', color: 'from-emerald-800 to-emerald-600' },
  { label: 'Piscina', color: 'from-blue-800 to-blue-600' },
  { label: 'Golf', color: 'from-green-800 to-green-600' },
  { label: 'Turismo', color: 'from-orange-800 to-orange-600' },
  { label: 'Ecoturismo', color: 'from-teal-800 to-teal-600' },
  { label: 'Playa', color: 'from-cyan-800 to-cyan-600' },
]

export function HeroSection({ imagenes }: Props) {
  const router = useRouter()

  const handleClickImagen = (imagen: HeroImagenConActividad) => {
    if (imagen.actividad_id) {
      router.push(`/buscar?actividad=${imagen.actividad_id}`)
    }
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#1F3A5F]">
      {/* Columnas de imágenes de fondo tipo Pinterest */}
      <div className="absolute inset-0 flex gap-2 p-2 opacity-40">
        {imagenes.length > 0 ? (
          imagenes.map((img, i) => (
            <div
              key={img.id}
              className="flex-1 relative rounded-xl overflow-hidden cursor-pointer group"
              onClick={() => handleClickImagen(img)}
            >
              <Image
                src={img.imagen_url}
                alt={img.actividad?.nombre ?? 'Experiencia'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-700"
                sizes="50vw"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              {img.actividad && (
                <div className="absolute bottom-4 left-4">
                  <span className="text-white text-sm font-semibold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                    {img.actividad.nombre}
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          // Placeholder cuando no hay imágenes en la BD
          PLACEHOLDER_CARDS.map((card, i) => (
            <div
              key={i}
              className={`flex-1 relative rounded-xl overflow-hidden bg-gradient-to-b ${card.color} flex items-end pb-6 pl-4`}
            >
              <span className="text-white/80 text-sm font-semibold">{card.label}</span>
            </div>
          ))
        )}
      </div>

      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-[#1F3A5F]/60" />

      {/* Contenido central */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight mb-3 drop-shadow-lg">
          Encuentra tu
          <span className="block text-[#4A7FB3]">estilo de vida</span>
        </h1>
        <p className="text-white/80 text-lg mb-2">
          Descubre inmuebles y las experiencias que los rodean
        </p>

        {/* Indicador de scroll */}
        <button
          onClick={() => document.getElementById('destacados')?.scrollIntoView({ behavior: 'smooth' })}
          className="mt-8 flex flex-col items-center gap-1 text-white/60 hover:text-white/90 transition-colors mx-auto"
          aria-label="Ver inmuebles"
        >
          <span className="text-xs">Explorar</span>
          <svg className="w-5 h-5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
