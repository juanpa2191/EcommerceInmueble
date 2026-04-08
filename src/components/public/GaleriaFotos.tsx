'use client'

import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, Home } from 'lucide-react'

type Props = {
  fotos: { imagen_url: string }[]
  ofertaPrincipalId: string | null
}

export function GaleriaFotos({ fotos, ofertaPrincipalId }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Track view on mount
  useEffect(() => {
    if (ofertaPrincipalId) {
      fetch(`/api/ofertas/${ofertaPrincipalId}/vista`, { method: 'POST' }).catch(() => {})
    }
  }, [ofertaPrincipalId])

  if (fotos.length === 0) {
    return (
      <div className="relative h-[60vh] md:h-[50vh] w-full bg-gradient-to-br from-[#2E5C8A] to-[#1F3A5F] flex items-center justify-center">
        <Home className="w-20 h-20 text-white/30" />
      </div>
    )
  }

  return (
    <div className="relative h-[60vh] md:h-[50vh] w-full overflow-hidden bg-[#1F3A5F]">
      {/* Embla viewport */}
      <div ref={emblaRef} className="overflow-hidden h-full">
        <div className="flex h-full">
          {fotos.map((foto, index) => (
            <div key={foto.imagen_url} className="flex-[0_0_100%] relative h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foto.imagen_url}
                alt={`Foto ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Prev / Next buttons */}
      {fotos.length > 1 && (
        <>
          <button
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors disabled:opacity-40"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
            aria-label="Foto siguiente"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-colors disabled:opacity-40"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {fotos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
          {fotos.map((_, index) => (
            <button
              key={index}
              onClick={() => emblaApi?.scrollTo(index)}
              aria-label={`Ir a foto ${index + 1}`}
              className={[
                'rounded-full transition-all',
                index === selectedIndex
                  ? 'w-5 h-2 bg-white'
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75',
              ].join(' ')}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {fotos.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
          {selectedIndex + 1} / {fotos.length}
        </div>
      )}
    </div>
  )
}
