'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, MapPin, Activity } from 'lucide-react'

type Suggestion = {
  type: 'municipio' | 'departamento' | 'actividad'
  id: string
  label: string
  sublabel?: string
}

export function SearchBar() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQ)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Sync query when URL changes (e.g. limpiar filtros)
  useEffect(() => {
    setQuery(searchParams.get('q') ?? '')
  }, [searchParams])

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/search/suggestions?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSuggestions(data)
      setOpen(data.length > 0)
    } catch {
      setSuggestions([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query, fetchSuggestions])

  const handleSelect = (suggestion: Suggestion) => {
    setOpen(false)
    setQuery(suggestion.label)
    const params = new URLSearchParams()
    // q lleva el label visible (para el buscador y el texto "X resultados para...")
    params.set('q', suggestion.label)
    if (suggestion.type === 'municipio') params.set('municipio', suggestion.id)
    if (suggestion.type === 'actividad') params.set('actividad', suggestion.id)
    router.push(`/buscar?${params.toString()}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    setOpen(false)
    router.push(`/buscar?q=${encodeURIComponent(query)}`)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B6B6B] w-4 h-4" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            placeholder="Busca por ciudad o experiencia..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white text-[#2B2B2B] placeholder-[#6B6B6B] text-sm focus:outline-none focus:ring-2 focus:ring-[#4A7FB3]"
          />
        </div>
      </form>

      {open && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-white rounded-lg shadow-xl border border-[#D9D9D9] z-50 overflow-hidden">
          {suggestions.map(s => (
            <button
              key={`${s.type}-${s.id}`}
              onMouseDown={() => handleSelect(s)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5F5] text-left transition-colors"
            >
              {s.type === 'municipio' || s.type === 'departamento'
                ? <MapPin className="w-4 h-4 text-[#2E5C8A] flex-shrink-0" />
                : <Activity className="w-4 h-4 text-[#4A7FB3] flex-shrink-0" />
              }
              <div>
                <span className="text-sm font-medium text-[#2B2B2B]">{s.label}</span>
                {s.sublabel && (
                  <span className="text-xs text-[#6B6B6B] ml-1">· {s.sublabel}</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
