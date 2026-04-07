'use client'

import { useRef, useState, useTransition } from 'react'
import { toast } from 'sonner'
import { ImagePlus, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  crearActividad,
  toggleActividad,
  toggleLanding,
  actualizarImagenActividad,
} from '@/lib/actions/admin'
import { createClient } from '@/lib/supabase/client'
import type { ActividadAdmin } from '@/lib/supabase/queries/admin'

interface Props {
  actividades: ActividadAdmin[]
}

const MAX_SIZE = 5 * 1024 * 1024

async function uploadActividadFile(file: File, actividadId: string): Promise<string | null> {
  const supabase = createClient()
  const ext = file.name.split('.').pop()
  const path = `actividades/${actividadId}.${ext}`
  const { error } = await supabase.storage
    .from('actividades')
    .upload(path, file, { upsert: true })
  if (error) return null
  return supabase.storage.from('actividades').getPublicUrl(path).data.publicUrl
}

export function ActividadesAdminClient({ actividades }: Props) {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [tipo, setTipo] = useState<'interna' | 'entorno'>('interna')
  const [activo, setActivo] = useState(true)
  const [isPending, startTransition] = useTransition()

  function handleCrear() {
    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    startTransition(async () => {
      const result = await crearActividad({ nombre: nombre.trim(), tipo, activo })
      if (result.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success('Actividad creada')
        setNombre('')
        setTipo('interna')
        setActivo(true)
        setOpen(false)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Botón nueva actividad */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]" />
            }
          >
            <Plus className="size-4" />
            Nueva actividad
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva actividad</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="nombre-actividad">Nombre</Label>
                <Input
                  id="nombre-actividad"
                  placeholder="Ej: Piscina, Parque, Gimnasio..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <Select
                  value={tipo}
                  onValueChange={(v) => setTipo(v as 'interna' | 'entorno')}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interna">Interna</SelectItem>
                    <SelectItem value="entorno">Entorno</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  role="switch"
                  aria-checked={activo}
                  onClick={() => setActivo((v) => !v)}
                  className={[
                    'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors',
                    activo ? 'bg-[#1F3A5F]' : 'bg-[#D9D9D9]',
                  ].join(' ')}
                >
                  <span
                    className={[
                      'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform',
                      activo ? 'translate-x-4' : 'translate-x-0',
                    ].join(' ')}
                  />
                </button>
                <Label>Activo</Label>
              </div>
            </div>
            <DialogFooter>
              <DialogClose render={<Button variant="outline" />}>
                Cancelar
              </DialogClose>
              <Button
                onClick={handleCrear}
                disabled={isPending}
                className="bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]"
              >
                {isPending ? 'Guardando...' : 'Crear actividad'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-[#D9D9D9] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D9D9D9] bg-[#F5F5F5] text-left">
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Imagen</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Nombre</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Tipo</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Activo</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">En landing</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Orden landing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]">
              {actividades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-[#6B6B6B]">
                    No hay actividades registradas
                  </td>
                </tr>
              ) : (
                actividades.map((act) => (
                  <ActividadRow key={act.id} actividad={act} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ActividadRow({ actividad }: { actividad: ActividadAdmin }) {
  const [isPending, startTransition] = useTransition()
  const [ordenValue, setOrdenValue] = useState(
    actividad.orden_landing?.toString() ?? ''
  )
  const [uploading, setUploading] = useState(false)
  const [localImgUrl, setLocalImgUrl] = useState<string | null>(
    actividad.imagen_url ?? null
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleToggleActivo() {
    startTransition(async () => {
      const result = await toggleActividad(actividad.id, !actividad.activo)
      if (result.error) {
        toast.error('Error: ' + result.error)
      }
    })
  }

  function handleToggleLanding() {
    const nuevoMostrar = !actividad.mostrar_en_landing
    const orden = nuevoMostrar
      ? ordenValue ? parseInt(ordenValue) : undefined
      : undefined
    startTransition(async () => {
      const result = await toggleLanding(actividad.id, nuevoMostrar, orden)
      if (result.error) {
        toast.error('Error: ' + result.error)
      }
    })
  }

  function handleOrdenBlur() {
    if (!actividad.mostrar_en_landing) return
    const orden = ordenValue ? parseInt(ordenValue) : undefined
    startTransition(async () => {
      const result = await toggleLanding(actividad.id, true, orden)
      if (result.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success('Orden actualizado')
      }
    })
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > MAX_SIZE) {
      toast.error(`Imagen demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máx. 5 MB.`)
      e.target.value = ''
      return
    }
    setUploading(true)
    try {
      const url = await uploadActividadFile(file, actividad.id)
      if (!url) {
        toast.error('Error al subir la imagen')
        return
      }
      const result = await actualizarImagenActividad(actividad.id, url)
      if (result.error) {
        toast.error('Error: ' + result.error)
      } else {
        setLocalImgUrl(url)
        toast.success('Imagen actualizada')
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <tr className="hover:bg-[#F5F5F5]">
      {/* Imagen */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {localImgUrl ? (
            <img
              src={localImgUrl}
              alt={actividad.nombre}
              className="size-10 rounded object-cover border border-[#D9D9D9]"
            />
          ) : (
            <div className="size-10 rounded border border-dashed border-[#D9D9D9] bg-[#F5F5F5] flex items-center justify-center">
              <ImagePlus className="size-4 text-[#D9D9D9]" />
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleImageChange}
          />
          <button
            type="button"
            disabled={uploading || isPending}
            onClick={() => fileInputRef.current?.click()}
            className="text-xs text-[#4A7FB3] hover:underline disabled:opacity-50"
          >
            {uploading ? 'Subiendo...' : localImgUrl ? 'Cambiar' : 'Subir'}
          </button>
        </div>
      </td>
      <td className="px-4 py-3 font-medium text-[#2B2B2B]">{actividad.nombre}</td>
      <td className="px-4 py-3">
        <span
          className={[
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            actividad.tipo === 'interna'
              ? 'bg-blue-100 text-blue-800'
              : 'bg-purple-100 text-purple-800',
          ].join(' ')}
        >
          {actividad.tipo === 'interna' ? 'Interna' : 'Entorno'}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={actividad.activo}
          disabled={isPending}
          onClick={handleToggleActivo}
          className={[
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50',
            actividad.activo ? 'bg-[#1F3A5F]' : 'bg-[#D9D9D9]',
          ].join(' ')}
        >
          <span
            className={[
              'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform',
              actividad.activo ? 'translate-x-4' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </td>
      <td className="px-4 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={actividad.mostrar_en_landing}
          disabled={isPending}
          onClick={handleToggleLanding}
          className={[
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50',
            actividad.mostrar_en_landing ? 'bg-[#1F3A5F]' : 'bg-[#D9D9D9]',
          ].join(' ')}
        >
          <span
            className={[
              'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform',
              actividad.mostrar_en_landing ? 'translate-x-4' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </td>
      <td className="px-4 py-3">
        {actividad.mostrar_en_landing ? (
          <Input
            type="number"
            min={1}
            value={ordenValue}
            onChange={(e) => setOrdenValue(e.target.value)}
            onBlur={handleOrdenBlur}
            disabled={isPending}
            className="w-20"
            placeholder="1"
          />
        ) : (
          <span className="text-[#D9D9D9]">—</span>
        )}
      </td>
    </tr>
  )
}
