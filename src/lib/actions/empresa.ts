'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type CrearOfertaInput = {
  matricula: string
  tipo_inmueble_id: string
  metros_cuadrados: number
  municipio_id: string
  precio: number
  descripcion: string
  actividad_ids: string[]
  foto_urls: string[]
}

export type ActionResult = {
  error?: string
  success?: boolean
  ofertaId?: string
}

async function getEmpresaAprobada(): Promise<{ empresa_id: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado' }

  const { data: usuarioRaw } = await supabase
    .from('usuarios')
    .select('empresa_id')
    .eq('id', user.id)
    .single()

  const usuario = usuarioRaw as { empresa_id: string | null } | null
  if (!usuario?.empresa_id) return { error: 'No se encontró la empresa asociada' }

  // Verificar que la empresa esté aprobada
  const { data: empresaRaw } = await supabase
    .from('empresas')
    .select('estado')
    .eq('id', usuario.empresa_id)
    .single()

  const estado = (empresaRaw as { estado: string } | null)?.estado
  if (estado !== 'aprobada') {
    return { error: 'Tu empresa debe estar aprobada para publicar ofertas' }
  }

  return { empresa_id: usuario.empresa_id }
}

export async function crearOferta(input: CrearOfertaInput): Promise<ActionResult> {
  const empresaResult = await getEmpresaAprobada()
  if ('error' in empresaResult) return { error: empresaResult.error }
  const { empresa_id } = empresaResult

  const supabase = await createClient()

  // 1. Verificar si el predio ya existe por matrícula
  const { data: predioExistente } = await supabase
    .from('predios')
    .select('id')
    .eq('matricula', input.matricula)
    .single()

  let predioId: string

  if (predioExistente) {
    predioId = (predioExistente as any).id
  } else {
    const { data: nuevoPredio, error: predioError } = await supabase
      .from('predios')
      .insert({
        matricula: input.matricula,
        tipo_inmueble_id: input.tipo_inmueble_id,
        metros_cuadrados: input.metros_cuadrados,
        municipio_id: input.municipio_id,
      } as any)
      .select('id')
      .single()

    if (predioError || !nuevoPredio) return { error: 'Error al crear el predio' }
    predioId = (nuevoPredio as any).id
  }

  // 2. Verificar que esta empresa no tenga ya una oferta para este predio
  const { data: ofertaExistente } = await supabase
    .from('ofertas')
    .select('id')
    .eq('predio_id', predioId)
    .eq('empresa_id', empresa_id)
    .single()

  if (ofertaExistente) return { error: 'Ya tienes una oferta para este inmueble' }

  // 3. Crear la oferta
  const { data: oferta, error: ofertaError } = await supabase
    .from('ofertas')
    .insert({
      predio_id: predioId,
      empresa_id,
      precio: input.precio,
      descripcion: input.descripcion,
      activo: true,
    } as any)
    .select('id')
    .single()

  if (ofertaError || !oferta) return { error: 'Error al crear la oferta' }
  const ofertaId = (oferta as any).id

  // 4. Insertar actividades
  if (input.actividad_ids.length > 0) {
    await supabase
      .from('oferta_actividades')
      .insert(
        input.actividad_ids.map((aid) => ({
          oferta_id: ofertaId,
          actividad_id: aid,
        })) as any
      )
  }

  // 5. Insertar fotos
  if (input.foto_urls.length > 0) {
    await supabase
      .from('oferta_fotos')
      .insert(
        input.foto_urls.map((url, i) => ({
          oferta_id: ofertaId,
          imagen_url: url,
          orden: i,
        })) as any
      )
  }

  revalidatePath('/empresa/dashboard')
  redirect('/empresa/dashboard')
}

export async function actualizarOferta(
  ofertaId: string,
  input: Partial<CrearOfertaInput>
): Promise<ActionResult> {
  const empresaResult = await getEmpresaAprobada()
  if ('error' in empresaResult) return { error: empresaResult.error }
  const { empresa_id } = empresaResult

  const supabase = await createClient()

  // Verificar que la oferta pertenece a esta empresa antes de cualquier write
  const { data: ofertaCheck } = await supabase
    .from('ofertas')
    .select('id')
    .eq('id', ofertaId)
    .eq('empresa_id', empresa_id)
    .single()

  if (!ofertaCheck) return { error: 'Oferta no encontrada o no autorizada' }

  // Actualizar precio/descripción
  if (input.precio || input.descripcion) {
    const ofertaUpdate: any = {}
    if (input.precio) ofertaUpdate.precio = input.precio
    if (input.descripcion) ofertaUpdate.descripcion = input.descripcion
    await (supabase.from('ofertas') as any)
      .update(ofertaUpdate)
      .eq('id', ofertaId)
      .eq('empresa_id', empresa_id)
  }

  // Reemplazar actividades
  if (input.actividad_ids !== undefined) {
    await supabase
      .from('oferta_actividades')
      .delete()
      .eq('oferta_id', ofertaId)

    if (input.actividad_ids.length > 0) {
      await supabase
        .from('oferta_actividades')
        .insert(
          input.actividad_ids.map((aid) => ({
            oferta_id: ofertaId,
            actividad_id: aid,
          })) as any
        )
    }
  }

  revalidatePath('/empresa/dashboard')
  redirect('/empresa/dashboard')
}
