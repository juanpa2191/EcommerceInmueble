'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { ActividadLanding } from '@/lib/supabase/queries/landing'

type Props = {
  actividades: ActividadLanding[]
}

const GRADIENT_FALLBACKS = [
  'from-emerald-700 to-teal-600',
  'from-blue-700 to-cyan-600',
  'from-orange-700 to-amber-600',
  'from-purple-700 to-violet-600',
  'from-rose-700 to-pink-600',
  'from-green-700 to-emerald-600',
]

export function ActivitiesSection({ actividades }: Props) {
  const router = useRouter()

  return (
    <section id="actividades" className="bg-[#F5F5F5] py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-[#1F3A5F] mb-2">Experiencias disponibles</h2>
          <p className="text-[#6B6B6B]">Descubre qué puedes vivir cerca de tu próximo hogar</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {actividades.map((actividad, i) => (
            <button
              key={actividad.id}
              onClick={() => router.push(`/buscar?actividad=${actividad.id}`)}
              className="group relative h-40 rounded-xl overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4A7FB3]"
            >
              {actividad.imagen_url ? (
                <Image
                  src={actividad.imagen_url}
                  alt={actividad.nombre}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 25vw"
                  loading="lazy"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${GRADIENT_FALLBACKS[i % GRADIENT_FALLBACKS.length]}`} />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-all" />
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-semibold text-sm">{actividad.nombre}</p>
                <p className="text-white/70 text-xs mt-0.5">
                  {actividad.tipo === 'interna' ? 'En el inmueble' : 'En la zona'}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
