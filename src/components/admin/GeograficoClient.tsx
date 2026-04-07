'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, Info } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { DepartamentoConMunicipios } from '@/lib/supabase/queries/admin'

interface Props {
  departamentos: DepartamentoConMunicipios[]
}

export function GeograficoClient({ departamentos }: Props) {
  const [busqueda, setBusqueda] = useState('')
  const [expandidos, setExpandidos] = useState<Set<string>>(new Set())

  const query = busqueda.toLowerCase().trim()

  const filtrados = departamentos
    .map((dep) => {
      if (!query) return dep
      const municipiosFiltrados = dep.municipios.filter((m) =>
        m.nombre.toLowerCase().includes(query)
      )
      const depCoincide = dep.nombre.toLowerCase().includes(query)
      if (!depCoincide && municipiosFiltrados.length === 0) return null
      return { ...dep, municipios: depCoincide ? dep.municipios : municipiosFiltrados }
    })
    .filter((d): d is DepartamentoConMunicipios => d !== null)

  function toggleExpandido(id: string) {
    setExpandidos((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Auto-expandir cuando hay búsqueda activa
  const departamentosConExpansion = filtrados.map((dep) => ({
    ...dep,
    expandido: query ? true : expandidos.has(dep.id),
  }))

  return (
    <div className="space-y-4">
      {/* Nota */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <Info className="size-4 shrink-0 mt-0.5" />
        <span>
          Los datos geográficos se gestionan vía migraciones SQL. Esta vista es de solo lectura.
        </span>
      </div>

      {/* Buscador */}
      <Input
        placeholder="Buscar departamento o municipio..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="max-w-sm"
      />

      {/* Totales */}
      <p className="text-xs text-[#6B6B6B]">
        {filtrados.length} departamento{filtrados.length !== 1 ? 's' : ''} —{' '}
        {filtrados.reduce((acc, d) => acc + d.municipios.length, 0)} municipio
        {filtrados.reduce((acc, d) => acc + d.municipios.length, 0) !== 1 ? 's' : ''}
      </p>

      {/* Lista acordeón */}
      <div className="space-y-2">
        {departamentosConExpansion.length === 0 ? (
          <div className="rounded-xl border border-[#D9D9D9] bg-white py-10 text-center text-sm text-[#6B6B6B]">
            No se encontraron resultados para "{busqueda}"
          </div>
        ) : (
          departamentosConExpansion.map((dep) => (
            <div
              key={dep.id}
              className="overflow-hidden rounded-xl border border-[#D9D9D9] bg-white"
            >
              {/* Header del departamento */}
              <button
                type="button"
                onClick={() => toggleExpandido(dep.id)}
                className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#F5F5F5] transition-colors"
              >
                <div className="flex items-center gap-3">
                  {dep.expandido ? (
                    <ChevronDown className="size-4 text-[#6B6B6B]" />
                  ) : (
                    <ChevronRight className="size-4 text-[#6B6B6B]" />
                  )}
                  <span className="font-medium text-[#2B2B2B]">{dep.nombre}</span>
                </div>
                <span className="inline-flex items-center rounded-full bg-[#1F3A5F]/10 px-2.5 py-0.5 text-xs font-medium text-[#1F3A5F]">
                  {dep.municipios.length} municipio{dep.municipios.length !== 1 ? 's' : ''}
                </span>
              </button>

              {/* Municipios */}
              {dep.expandido && (
                <div className="border-t border-[#D9D9D9] px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {dep.municipios.map((mun) => (
                      <span
                        key={mun.id}
                        className="inline-flex items-center rounded-full bg-[#F5F5F5] px-3 py-1 text-xs text-[#2B2B2B]"
                      >
                        {mun.nombre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
