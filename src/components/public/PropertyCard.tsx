'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { PredioDestacadoCard } from '@/lib/supabase/queries/landing'
import { formatPrecio, formatMetros } from '@/lib/utils/format'

type Props = {
  predio: PredioDestacadoCard
}

export function PropertyCard({ predio }: Props) {
  return (
    <Link href={`/inmueble/${predio.matricula}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#D9D9D9] hover:shadow-md transition-shadow">
        {/* Imagen */}
        <div className="relative h-52 bg-[#F5F5F5]">
          {predio.foto_portada ? (
            <Image
              src={predio.foto_portada}
              alt={`Inmueble en ${predio.municipio_nombre}`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#2E5C8A] to-[#1F3A5F]">
              <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </div>
          )}

          {/* Badge tipo */}
          <div className="absolute top-3 left-3">
            <span className="bg-[#1F3A5F] text-white text-xs font-medium px-2.5 py-1 rounded-full">
              {predio.tipo_nombre}
            </span>
          </div>

          {/* Badge multi-empresa */}
          {predio.total_empresas > 1 && (
            <div className="absolute top-3 right-3">
              <span className="bg-white/90 text-[#2E5C8A] text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                {predio.total_empresas} empresas
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <p className="text-sm text-[#6B6B6B] mb-1">
            {predio.municipio_nombre}, {predio.departamento_nombre}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-[#2B2B2B] font-bold text-lg">
              {predio.total_empresas > 1
                ? `Desde ${formatPrecio(predio.precio_minimo)}`
                : formatPrecio(predio.precio_minimo)
              }
            </span>
            <span className="text-[#6B6B6B] text-sm">{formatMetros(predio.metros_cuadrados)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
