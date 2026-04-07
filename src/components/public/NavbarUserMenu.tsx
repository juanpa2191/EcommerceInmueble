'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react'
import { cerrarSesion } from '@/lib/actions/auth'
import { useTransition } from 'react'

type Props = {
  rol: 'admin' | 'empresa' | null
  nombre: string
}

export function NavbarUserMenu({ rol, nombre }: Props) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const panelHref = rol === 'admin' ? '/admin/dashboard' : '/empresa/dashboard'
  const panelLabel = rol === 'admin' ? 'Panel Admin' : 'Panel Empresa'

  return (
    <div className="relative flex-shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white px-3 py-2 rounded-lg transition-colors text-sm font-medium"
      >
        <User className="w-4 h-4" />
        <span className="hidden sm:block max-w-[120px] truncate">{nombre}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-[#D9D9D9] py-1 z-50">
          {rol && (
            <>
              <Link
                href={panelHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[#2B2B2B] hover:bg-[#F5F5F5] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#2E5C8A]" />
                {panelLabel}
              </Link>
              <div className="border-t border-[#D9D9D9] my-1" />
            </>
          )}

          <button
            onClick={() => {
              setOpen(false)
              startTransition(() => cerrarSesion())
            }}
            disabled={isPending}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
            {isPending ? 'Saliendo...' : 'Cerrar sesión'}
          </button>
        </div>
      )}
    </div>
  )
}
