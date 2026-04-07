import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/empresa/dashboard'
  // Prevenir open redirect — solo permitir rutas internas relativas
  const next = rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/empresa/dashboard'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.user) {
      // Verificar si ya tiene perfil de usuario
      const { data: usuario } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('id', data.user.id)
        .single<{ rol: 'admin' | 'empresa' }>()

      if (!usuario) {
        // Nuevo usuario via Google — redirigir a completar registro de empresa
        return NextResponse.redirect(
          `${origin}/registro?step=empresa&email=${encodeURIComponent(data.user.email ?? '')}`
        )
      }

      const destino = usuario.rol === 'admin' ? '/admin/dashboard' : next
      return NextResponse.redirect(`${origin}${destino}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
