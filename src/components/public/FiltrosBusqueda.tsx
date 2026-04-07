'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import type { FiltrosDisponibles } from '@/lib/supabase/queries/buscar'
import { Search, X } from 'lucide-react'

type Props = {
  filtrosDisponibles: FiltrosDisponibles
}

export function FiltrosBusqueda({ filtrosDisponibles }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const buildUrl = useCallback(
    (overrides: Record<string, string | string[] | undefined>) => {
      const params = new URLSearchParams()

      // Copy existing params
      const existing: Record<string, string | string[]> = {}
      searchParams.forEach((value, key) => {
        const current = existing[key]
        if (current) {
          existing[key] = Array.isArray(current) ? [...current, value] : [current, value]
        } else {
          existing[key] = value
        }
      })

      // Merge with overrides
      const merged = { ...existing, ...overrides }

      // Reset page on any filter change
      merged['page'] = '1'

      for (const [key, value] of Object.entries(merged)) {
        if (value === undefined || value === '') continue
        if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v))
        } else {
          params.set(key, value)
        }
      }

      return `/buscar?${params.toString()}`
    },
    [searchParams]
  )

  const currentQ = searchParams.get('q') ?? ''
  const currentTipoId = searchParams.get('tipoInmuebleId') ?? ''
  const currentPrecioMin = searchParams.get('precioMin') ?? ''
  const currentPrecioMax = searchParams.get('precioMax') ?? ''
  const currentMetrosMin = searchParams.get('metrosMin') ?? ''
  const currentMetrosMax = searchParams.get('metrosMax') ?? ''
  const currentActividadIds = searchParams.getAll('actividadIds')

  const handleToggleActividad = (id: string) => {
    const next = currentActividadIds.includes(id)
      ? currentActividadIds.filter((a) => a !== id)
      : [...currentActividadIds, id]
    router.push(buildUrl({ actividadIds: next.length > 0 ? next : undefined }))
  }

  const handleClearAll = () => {
    router.push('/buscar')
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-[#2B2B2B] text-base">Filtros</h2>
        <button
          onClick={handleClearAll}
          className="text-xs text-[#2E5C8A] hover:underline flex items-center gap-1"
        >
          <X className="w-3 h-3" />
          Limpiar filtros
        </button>
      </div>

      {/* Búsqueda por texto */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">
          Municipio
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] w-4 h-4" />
          <input
            type="text"
            defaultValue={currentQ}
            placeholder="Buscar municipio..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D9D9D9] text-sm text-[#2B2B2B] placeholder-[#6B6B6B] focus:outline-none focus:ring-2 focus:ring-[#4A7FB3] focus:border-transparent bg-white"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const val = (e.target as HTMLInputElement).value
                router.push(buildUrl({ q: val || undefined }))
              }
            }}
            onBlur={(e) => {
              const val = e.target.value
              const prev = currentQ
              if (val !== prev) {
                router.push(buildUrl({ q: val || undefined }))
              }
            }}
          />
        </div>
      </div>

      {/* Tipo de inmueble */}
      {filtrosDisponibles.tipos.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">
            Tipo de inmueble
          </label>
          <select
            value={currentTipoId}
            onChange={(e) => {
              const val = e.target.value
              router.push(buildUrl({ tipoInmuebleId: val || undefined }))
            }}
            className="w-full py-2 px-3 rounded-lg border border-[#D9D9D9] text-sm text-[#2B2B2B] bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7FB3] focus:border-transparent"
          >
            <option value="">Todos los tipos</option>
            {filtrosDisponibles.tipos.map((tipo) => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nombre} ({tipo.count})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Precio */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">
          Precio (COP)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            defaultValue={currentPrecioMin}
            placeholder="Mínimo"
            min={0}
            className="w-full py-2 px-3 rounded-lg border border-[#D9D9D9] text-sm text-[#2B2B2B] placeholder-[#6B6B6B] bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7FB3] focus:border-transparent"
            onBlur={(e) => {
              const val = e.target.value
              if (val !== currentPrecioMin) {
                router.push(buildUrl({ precioMin: val || undefined }))
              }
            }}
          />
          <span className="text-[#6B6B6B] text-xs flex-shrink-0">—</span>
          <input
            type="number"
            defaultValue={currentPrecioMax}
            placeholder="Máximo"
            min={0}
            className="w-full py-2 px-3 rounded-lg border border-[#D9D9D9] text-sm text-[#2B2B2B] placeholder-[#6B6B6B] bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7FB3] focus:border-transparent"
            onBlur={(e) => {
              const val = e.target.value
              if (val !== currentPrecioMax) {
                router.push(buildUrl({ precioMax: val || undefined }))
              }
            }}
          />
        </div>
      </div>

      {/* Metros */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">
          Superficie (m²)
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            defaultValue={currentMetrosMin}
            placeholder="Mínimo"
            min={0}
            className="w-full py-2 px-3 rounded-lg border border-[#D9D9D9] text-sm text-[#2B2B2B] placeholder-[#6B6B6B] bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7FB3] focus:border-transparent"
            onBlur={(e) => {
              const val = e.target.value
              if (val !== currentMetrosMin) {
                router.push(buildUrl({ metrosMin: val || undefined }))
              }
            }}
          />
          <span className="text-[#6B6B6B] text-xs flex-shrink-0">—</span>
          <input
            type="number"
            defaultValue={currentMetrosMax}
            placeholder="Máximo"
            min={0}
            className="w-full py-2 px-3 rounded-lg border border-[#D9D9D9] text-sm text-[#2B2B2B] placeholder-[#6B6B6B] bg-white focus:outline-none focus:ring-2 focus:ring-[#4A7FB3] focus:border-transparent"
            onBlur={(e) => {
              const val = e.target.value
              if (val !== currentMetrosMax) {
                router.push(buildUrl({ metrosMax: val || undefined }))
              }
            }}
          />
        </div>
      </div>

      {/* Actividades */}
      {filtrosDisponibles.actividades.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-xs font-medium text-[#6B6B6B] uppercase tracking-wide">
            Actividades
          </label>
          <div className="flex flex-wrap gap-2">
            {filtrosDisponibles.actividades.map((actividad) => {
              const isActive = currentActividadIds.includes(actividad.id)
              return (
                <button
                  key={actividad.id}
                  onClick={() => handleToggleActividad(actividad.id)}
                  className={[
                    'text-xs px-3 py-1.5 rounded-full border transition-colors',
                    isActive
                      ? 'bg-[#1F3A5F] border-[#1F3A5F] text-white'
                      : 'bg-white border-[#D9D9D9] text-[#2B2B2B] hover:border-[#2E5C8A] hover:text-[#2E5C8A]',
                  ].join(' ')}
                >
                  {actividad.nombre} ({actividad.count})
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
