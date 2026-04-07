'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
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
import { crearTipo, toggleTipo } from '@/lib/actions/admin'
import type { TipoInmuebleAdmin } from '@/lib/supabase/queries/admin'

interface Props {
  tipos: TipoInmuebleAdmin[]
}

export function TiposAdminClient({ tipos }: Props) {
  const [open, setOpen] = useState(false)
  const [nombre, setNombre] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCrear() {
    if (!nombre.trim()) {
      toast.error('El nombre es requerido')
      return
    }
    startTransition(async () => {
      const result = await crearTipo(nombre.trim())
      if (result.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success('Tipo de inmueble creado')
        setNombre('')
        setOpen(false)
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Botón nuevo tipo */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button className="bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]" />
            }
          >
            <Plus className="size-4" />
            Nuevo tipo
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nuevo tipo de inmueble</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="nombre-tipo">Nombre</Label>
                <Input
                  id="nombre-tipo"
                  placeholder="Ej: Apartamento, Casa, Local comercial..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCrear()
                  }}
                />
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
                {isPending ? 'Guardando...' : 'Crear tipo'}
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
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Nombre</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Activo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]">
              {tipos.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-4 py-10 text-center text-[#6B6B6B]">
                    No hay tipos de inmueble registrados
                  </td>
                </tr>
              ) : (
                tipos.map((tipo) => <TipoRow key={tipo.id} tipo={tipo} />)
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function TipoRow({ tipo }: { tipo: TipoInmuebleAdmin }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleTipo(tipo.id, !tipo.activo)
      if (result.error) {
        toast.error('Error: ' + result.error)
      }
    })
  }

  return (
    <tr className="hover:bg-[#F5F5F5]">
      <td className="px-4 py-3 font-medium text-[#2B2B2B]">{tipo.nombre}</td>
      <td className="px-4 py-3">
        <button
          type="button"
          role="switch"
          aria-checked={tipo.activo}
          disabled={isPending}
          onClick={handleToggle}
          className={[
            'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors disabled:opacity-50',
            tipo.activo ? 'bg-[#1F3A5F]' : 'bg-[#D9D9D9]',
          ].join(' ')}
        >
          <span
            className={[
              'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform',
              tipo.activo ? 'translate-x-4' : 'translate-x-0',
            ].join(' ')}
          />
        </button>
      </td>
    </tr>
  )
}
