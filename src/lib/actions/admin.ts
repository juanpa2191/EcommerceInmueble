'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function requireAdmin(): Promise<{ error: string } | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: perfilRaw } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('id', user.id)
    .single()

  if ((perfilRaw as { rol: string } | null)?.rol !== 'admin') {
    return { error: 'No autorizado' }
  }
  return null
}

// ─── Empresas ────────────────────────────────────────────────────────────────

export async function aprobarEmpresa(empresaId: string): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('empresas')
    .update({ estado: 'aprobada' })
    .eq('id', empresaId)
  if (error) return { error: error.message }
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/empresas')
  return {}
}

export async function suspenderEmpresa(empresaId: string): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  // 'inactiva' es el valor correcto según el CHECK constraint del schema
  const { error } = await (supabase as any)
    .from('empresas')
    .update({ estado: 'inactiva' })
    .eq('id', empresaId)
  if (error) return { error: error.message }
  revalidatePath('/admin/dashboard')
  revalidatePath('/admin/empresas')
  return {}
}

export async function reactivarEmpresa(empresaId: string): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('empresas')
    .update({ estado: 'aprobada' })
    .eq('id', empresaId)
  if (error) return { error: error.message }
  revalidatePath('/admin/empresas')
  return {}
}

// ─── Actividades ─────────────────────────────────────────────────────────────

export async function crearActividad(data: {
  nombre: string
  tipo: 'interna' | 'entorno'
  activo: boolean
}): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  const { error } = await supabase.from('actividades').insert(data as any)
  if (error) return { error: error.message }
  revalidatePath('/admin/actividades')
  return {}
}

export async function toggleActividad(id: string, activo: boolean): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('actividades')
    .update({ activo })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/actividades')
  return {}
}

export async function toggleLanding(
  id: string,
  mostrar: boolean,
  orden?: number
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('actividades')
    .update({
      mostrar_en_landing: mostrar,
      orden_landing: mostrar ? (orden ?? null) : null,
    })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/actividades')
  return {}
}

// ─── Hero Imágenes ───────────────────────────────────────────────────────────

export async function subirHeroImagen(
  imagenUrl: string,
  actividadId: string | null,
  orden: number
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  const { error } = await supabase.from('hero_imagenes').insert({
    imagen_url: imagenUrl,
    actividad_id: actividadId,
    activo: true,
    orden,
  } as any)
  if (error) return { error: error.message }
  revalidatePath('/admin/hero')
  revalidatePath('/')
  return {}
}

export async function eliminarHeroImagen(id: string): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()

  // Obtener la URL antes de borrar para limpiar Storage
  const { data: imgRaw } = await supabase
    .from('hero_imagenes')
    .select('imagen_url')
    .eq('id', id)
    .single()

  const imagenUrl = (imgRaw as { imagen_url: string } | null)?.imagen_url

  // Borrar registro de BD
  const { error } = await supabase.from('hero_imagenes').delete().eq('id', id)
  if (error) return { error: error.message }

  // Borrar archivo de Storage — extraer path relativo al bucket
  if (imagenUrl) {
    const marker = '/object/public/hero/'
    const idx = imagenUrl.indexOf(marker)
    if (idx !== -1) {
      const storagePath = imagenUrl.slice(idx + marker.length)
      await supabase.storage.from('hero').remove([storagePath])
    }
  }

  revalidatePath('/admin/hero')
  revalidatePath('/')
  return {}
}

export async function toggleHeroActivo(id: string, activo: boolean): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('hero_imagenes')
    .update({ activo })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/hero')
  revalidatePath('/')
  return {}
}

// ─── Tipos de Inmueble ────────────────────────────────────────────────────────

export async function crearTipo(nombre: string): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('tipos_inmueble')
    .insert({ nombre, activo: true })
  if (error) return { error: error.message }
  revalidatePath('/admin/tipos')
  return {}
}

export async function toggleTipo(id: string, activo: boolean): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('tipos_inmueble')
    .update({ activo })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/tipos')
  return {}
}

// ─── Imagen de Actividad ─────────────────────────────────────────────────────

export async function actualizarImagenActividad(
  id: string,
  imagenUrl: string | null
): Promise<{ error?: string }> {
  const authErr = await requireAdmin()
  if (authErr) return authErr

  const supabase = await createClient()
  const { error } = await (supabase as any)
    .from('actividades')
    .update({ imagen_url: imagenUrl })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/actividades')
  revalidatePath('/')
  return {}
}
