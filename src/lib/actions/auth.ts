'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { TablesInsert } from '@/types/database.types'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

const registroSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  nit: z.string().min(5, 'NIT inválido').max(20),
  nombre: z.string().min(2, 'Nombre requerido'),
  telefono: z
    .string()
    .regex(/^3\d{9}$/, 'Teléfono colombiano inválido (10 dígitos, empieza por 3)'),
  correo: z.string().email('Correo inválido'),
  encargado_nombre: z.string().min(2, 'Nombre del encargado requerido'),
  encargado_telefono: z
    .string()
    .regex(/^3\d{9}$/, 'Teléfono colombiano inválido'),
})

export type ActionResult = {
  error?: string
  success?: boolean
}

export async function loginConEmail(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: 'Credenciales inválidas' }

  // Obtener rol del usuario autenticado
  const { data: usuarioRaw } = await supabase
    .from('usuarios')
    .select('rol')
    .single()

  const usuario = usuarioRaw as { rol: string } | null
  redirect(usuario?.rol === 'admin' ? '/admin/dashboard' : '/empresa/dashboard')
}

export async function loginConGoogle(): Promise<ActionResult> {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  })

  if (error) return { error: 'Error al iniciar sesión con Google' }
  if (data.url) redirect(data.url)

  return { success: true }
}

export async function registrarEmpresa(formData: FormData): Promise<ActionResult> {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    nit: formData.get('nit') as string,
    nombre: formData.get('nombre') as string,
    telefono: formData.get('telefono') as string,
    correo: formData.get('correo') as string,
    encargado_nombre: formData.get('encargado_nombre') as string,
    encargado_telefono: formData.get('encargado_telefono') as string,
  }

  const parsed = registroSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()

  // 1. Crear usuario en Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (authError) return { error: authError.message }
  if (!authData.user) return { error: 'Error al crear usuario' }

  // 2. Crear empresa en estado pendiente (requiere aprobación del admin)
  const empresaInsert: TablesInsert<'empresas'> = {
    nit: parsed.data.nit,
    nombre: parsed.data.nombre,
    telefono: parsed.data.telefono,
    correo: parsed.data.correo,
    encargado_nombre: parsed.data.encargado_nombre,
    encargado_telefono: parsed.data.encargado_telefono,
    estado: 'pendiente',
  }

  const { data: empresaRaw, error: empresaError } = await supabase
    .from('empresas')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(empresaInsert as any)
    .select('id')
    .single()

  if (empresaError) {
    if (empresaError.code === '23505') return { error: 'El NIT ya está registrado' }
    return { error: 'Error al crear la empresa' }
  }

  const empresa = empresaRaw as { id: string } | null
  if (!empresa) return { error: 'Error al obtener ID de empresa' }

  // 3. Crear perfil de usuario con rol empresa
  const usuarioInsert: TablesInsert<'usuarios'> = {
    id: authData.user.id,
    empresa_id: empresa.id,
    rol: 'empresa',
  }

  const { error: usuarioError } = await supabase
    .from('usuarios')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(usuarioInsert as any)

  if (usuarioError) return { error: 'Error al configurar el perfil' }

  return { success: true }
}

export async function cerrarSesion(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
