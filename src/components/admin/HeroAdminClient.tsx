'use client'

import { useState, useTransition, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'sonner'
import { Trash2, Upload, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  subirHeroImagen,
  eliminarHeroImagen,
  toggleHeroActivo,
} from '@/lib/actions/admin'
import { createClient } from '@/lib/supabase/client'
import type { HeroImagenAdmin, ActividadAdmin } from '@/lib/supabase/queries/admin'

interface Props {
  heroImagenes: HeroImagenAdmin[]
  actividades: ActividadAdmin[]
}

async function uploadHeroFile(file: File): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `hero/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('hero').upload(path, file, { upsert: false })
  if (error) return null
  return supabase.storage.from('hero').getPublicUrl(path).data.publicUrl
}

export function HeroAdminClient({ heroImagenes, actividades }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [actividadId, setActividadId] = useState<string>('none')
  const [orden, setOrden] = useState<string>('1')
  const [uploading, setUploading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const MAX_SIZE = 5 * 1024 * 1024 // 5 MB

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const f = acceptedFiles[0]
    if (!f) return
    if (f.size > MAX_SIZE) {
      toast.error(`La imagen es demasiado grande (${(f.size / 1024 / 1024).toFixed(1)} MB). El máximo permitido es 5 MB.`)
      return
    }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/jpeg': [], 'image/png': [], 'image/webp': [] },
    maxFiles: 1,
    maxSize: MAX_SIZE,
    onDropRejected: (rejections) => {
      const isTooBig = rejections[0]?.errors.some(e => e.code === 'file-too-large')
      if (isTooBig) {
        const size = rejections[0].file.size
        toast.error(`La imagen es demasiado grande (${(size / 1024 / 1024).toFixed(1)} MB). El máximo permitido es 5 MB.`)
      } else {
        toast.error('Formato no permitido. Usa JPG, PNG o WebP.')
      }
    },
  })

  async function handleSubir() {
    if (!file) {
      toast.error('Selecciona una imagen primero')
      return
    }
    const ordenNum = parseInt(orden)
    if (isNaN(ordenNum) || ordenNum < 1 || ordenNum > 2) {
      toast.error('El orden debe ser 1 o 2')
      return
    }
    setUploading(true)
    try {
      const url = await uploadHeroFile(file)
      if (!url) {
        toast.error('Error al subir la imagen al storage')
        return
      }
      const result = await subirHeroImagen(url, actividadId === 'none' ? null : actividadId, ordenNum)
      if (result.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success('Imagen hero subida correctamente')
        setFile(null)
        setPreview(null)
        setActividadId('none')
        setOrden('1')
      }
    } finally {
      setUploading(false)
    }
  }

  function handleEliminar(id: string) {
    startTransition(async () => {
      const result = await eliminarHeroImagen(id)
      if (result.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success('Imagen eliminada')
      }
    })
  }

  function handleToggleActivo(id: string, activo: boolean) {
    startTransition(async () => {
      const result = await toggleHeroActivo(id, activo)
      if (result.error) {
        toast.error('Error: ' + result.error)
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Nota informativa */}
      <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
        <Info className="size-4 shrink-0 mt-0.5" />
        <span>El hero acepta máximo 2 imágenes activas. Un trigger en la base de datos lo limita automáticamente.</span>
      </div>

      {/* Grid de imágenes actuales */}
      {heroImagenes.length > 0 && (
        <div>
          <h2 className="mb-4 text-base font-semibold text-[#2B2B2B]">
            Imágenes actuales
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {heroImagenes.map((img) => (
              <div
                key={img.id}
                className="overflow-hidden rounded-xl border border-[#D9D9D9] bg-white"
              >
                {/* Preview */}
                <div className="relative aspect-video bg-[#F5F5F5]">
                  <img
                    src={img.imagen_url}
                    alt={`Hero ${img.orden}`}
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute left-2 top-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white">
                    Orden {img.orden}
                  </span>
                </div>
                {/* Info y controles */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="space-y-0.5">
                    {img.actividad_nombre ? (
                      <p className="text-xs text-[#6B6B6B]">
                        Actividad: <span className="font-medium text-[#2B2B2B]">{img.actividad_nombre}</span>
                      </p>
                    ) : (
                      <p className="text-xs text-[#6B6B6B]">Sin actividad asociada</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Toggle activo */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={img.activo}
                      disabled={isPending}
                      onClick={() => handleToggleActivo(img.id, !img.activo)}
                      className={[
                        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50',
                        img.activo ? 'bg-[#1F3A5F]' : 'bg-[#D9D9D9]',
                      ].join(' ')}
                    >
                      <span
                        className={[
                          'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform',
                          img.activo ? 'translate-x-4' : 'translate-x-0',
                        ].join(' ')}
                      />
                    </button>
                    {/* Eliminar */}
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      disabled={isPending}
                      onClick={() => handleEliminar(img.id)}
                      className="text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Formulario de subida */}
      <div className="rounded-xl border border-[#D9D9D9] bg-white p-6">
        <h2 className="mb-4 text-base font-semibold text-[#2B2B2B]">
          Subir nueva imagen hero
        </h2>
        <div className="space-y-4">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={[
              'flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors',
              isDragActive
                ? 'border-[#1F3A5F] bg-blue-50'
                : 'border-[#D9D9D9] hover:border-[#4A7FB3]',
            ].join(' ')}
          >
            <input {...getInputProps()} />
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-48 rounded object-contain"
              />
            ) : (
              <>
                <Upload className="size-8 text-[#6B6B6B]" />
                <p className="mt-2 text-sm text-[#6B6B6B]">
                  {isDragActive
                    ? 'Suelta la imagen aquí'
                    : 'Arrastra una imagen o haz clic para seleccionar'}
                </p>
                <p className="mt-1 text-xs text-[#6B6B6B]">JPG, PNG, WebP · Máx. 5 MB</p>
              </>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Select actividad */}
            <div className="space-y-1.5">
              <Label htmlFor="hero-actividad">Actividad asociada (opcional)</Label>
              <select
                id="hero-actividad"
                value={actividadId}
                onChange={(e) => setActividadId(e.target.value)}
                className="w-full rounded-lg border border-[#D9D9D9] bg-white px-3 py-2 text-sm text-[#2B2B2B] focus:outline-none focus:ring-2 focus:ring-[#1F3A5F]/30"
              >
                <option value="none">Sin actividad</option>
                {actividades.map((act) => (
                  <option key={act.id} value={act.id}>
                    {act.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Orden */}
            <div className="space-y-1.5">
              <Label htmlFor="hero-orden">Orden (1 o 2)</Label>
              <Input
                id="hero-orden"
                type="number"
                min={1}
                max={2}
                value={orden}
                onChange={(e) => setOrden(e.target.value)}
                placeholder="1"
              />
            </div>
          </div>

          <Button
            onClick={handleSubir}
            disabled={uploading || !file}
            className="bg-[#1F3A5F] text-white hover:bg-[#2E5C8A] disabled:opacity-50"
          >
            <Upload className="size-4" />
            {uploading ? 'Subiendo...' : 'Subir imagen'}
          </Button>
        </div>
      </div>
    </div>
  )
}
