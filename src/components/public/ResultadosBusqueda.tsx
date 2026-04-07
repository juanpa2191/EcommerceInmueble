'use client'

import type { PredioResultado } from '@/lib/supabase/queries/buscar'
import { PropertyCard } from './PropertyCard'
import type { PredioDestacadoCard } from '@/lib/supabase/queries/landing'
import { Home } from 'lucide-react'

type Props = {
  predios: PredioResultado[]
  total: number
}

// PredioResultado is a superset of PredioDestacadoCard — cast is safe
function toPredioCard(p: PredioResultado): PredioDestacadoCard {
  return {
    id: p.id,
    matricula: p.matricula,
    metros_cuadrados: p.metros_cuadrados,
    municipio_nombre: p.municipio_nombre,
    departamento_nombre: p.departamento_nombre,
    tipo_nombre: p.tipo_nombre,
    precio_minimo: p.precio_minimo,
    total_empresas: p.total_empresas,
    foto_portada: p.foto_portada,
  }
}

export function ResultadosBusqueda({ predios, total }: Props) {
  if (predios.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-full bg-[#F5F5F5] flex items-center justify-center">
          <Home className="w-8 h-8 text-[#D9D9D9]" />
        </div>
        <div className="text-center">
          <p className="text-[#2B2B2B] font-semibold text-lg">
            No encontramos inmuebles con estos filtros
          </p>
          <p className="text-[#6B6B6B] text-sm mt-1">
            Intenta con otros criterios de búsqueda
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <p className="text-sm text-[#6B6B6B] mb-4">
        <span className="font-semibold text-[#2B2B2B]">{total}</span>{' '}
        {total === 1 ? 'inmueble encontrado' : 'inmuebles encontrados'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {predios.map((predio) => (
          <PropertyCard key={predio.id} predio={toPredioCard(predio)} />
        ))}
      </div>
    </>
  )
}
