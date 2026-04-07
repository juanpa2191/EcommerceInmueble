'use client'

import { useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { FiltrosDisponibles } from '@/lib/supabase/queries/buscar'
import { FiltrosBusqueda } from './FiltrosBusqueda'

type Props = {
  filtrosDisponibles: FiltrosDisponibles
  activeFiltersCount: number
}

export function FiltrosMobileSheet({ filtrosDisponibles, activeFiltersCount }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D9D9D9] bg-white text-sm font-medium text-[#2B2B2B] hover:border-[#2E5C8A] hover:text-[#2E5C8A] transition-colors">
            <SlidersHorizontal className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-[#1F3A5F] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        }
      />
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros de búsqueda</SheetTitle>
        </SheetHeader>
        <div className="p-4">
          <FiltrosBusqueda filtrosDisponibles={filtrosDisponibles} />
        </div>
      </SheetContent>
    </Sheet>
  )
}
