import { Suspense } from 'react'
import Link from 'next/link'
import { SearchBar } from './SearchBar'
import { NavbarUserMenu } from './NavbarUserMenu'
import { createClient } from '@/lib/supabase/server'

async function NavbarAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex-shrink-0 bg-white/15 hover:bg-white/25 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
      >
        Iniciar sesión
      </Link>
    )
  }

  const { data: usuarioRaw } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  const usuario = usuarioRaw as { rol: 'admin' | 'empresa' } | null
  const nombre = user.email?.split('@')[0] ?? 'Usuario'

  // Sesión activa pero sin perfil en usuarios (ej: admin creado directo en Supabase
  // o usuario Google sin completar registro) — mostrar igual el menú sin panel
  return <NavbarUserMenu rol={usuario?.rol ?? null} nombre={nombre} />
}

export function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#1F3A5F] shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <span className="text-white font-bold text-xl tracking-tight">
            InmuebleVida
          </span>
        </Link>

        {/* Buscador sticky */}
        <div className="flex-1 max-w-2xl">
          <Suspense fallback={<div className="h-10 bg-white/20 rounded-lg animate-pulse" />}>
            <SearchBar />
          </Suspense>
        </div>

        {/* Auth */}
        <Suspense fallback={<div className="w-28 h-9 bg-white/20 rounded-lg animate-pulse flex-shrink-0" />}>
          <NavbarAuth />
        </Suspense>
      </div>
    </header>
  )
}
