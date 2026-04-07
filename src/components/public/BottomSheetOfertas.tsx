'use client'

import { useState } from 'react'
import { Drawer } from 'vaul'
import type { OfertaDetalle, DetalleInmueble } from '@/lib/supabase/queries/detalle'
import { formatPrecio, formatWhatsAppLink } from '@/lib/utils/format'
import { Separator } from '@/components/ui/separator'
import { MessageCircle, ChevronRight } from 'lucide-react'

type Props = {
  ofertas: OfertaDetalle[]
  inmueble: Pick<DetalleInmueble, 'tipo_nombre' | 'municipio_nombre' | 'departamento_nombre' | 'metros_cuadrados'>
}

export function BottomSheetOfertas({ ofertas, inmueble }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Drawer.Root open={open} onOpenChange={setOpen}>
      <Drawer.Trigger asChild>
        <button className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#1F3A5F] text-[#1F3A5F] font-semibold hover:bg-[#1F3A5F] hover:text-white transition-colors">
          Ver todas las ofertas
          <ChevronRight className="w-4 h-4" />
        </button>
      </Drawer.Trigger>

      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto focus:outline-none">
          {/* Drag handle */}
          <div className="mx-auto w-12 h-1.5 rounded-full bg-[#D9D9D9] mb-5" />

          <Drawer.Title className="text-lg font-bold text-[#2B2B2B] mb-1">
            Ofertas disponibles
          </Drawer.Title>
          <Drawer.Description className="text-sm text-[#6B6B6B] mb-5">
            {ofertas.length} {ofertas.length === 1 ? 'empresa ofrece' : 'empresas ofrecen'} este inmueble
          </Drawer.Description>

          <div className="flex flex-col gap-0">
            {ofertas.map((oferta, index) => (
              <div key={oferta.id}>
                {index > 0 && <Separator className="my-4" />}
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="font-bold text-[#2B2B2B]">{oferta.empresa_nombre}</p>
                    <p className="text-2xl font-bold text-[#1F3A5F] mt-0.5">
                      {formatPrecio(oferta.precio)}
                    </p>
                  </div>

                  {oferta.descripcion && (
                    <p className="text-sm text-[#6B6B6B] line-clamp-2">
                      {oferta.descripcion}
                    </p>
                  )}

                  <div className="text-xs text-[#6B6B6B]">
                    Encargado: {oferta.encargado_nombre}
                  </div>

                  <a
                    href={formatWhatsAppLink({
                      telefono: oferta.encargado_telefono,
                      nombreInmueble: inmueble.tipo_nombre,
                      municipio: inmueble.municipio_nombre,
                      departamento: inmueble.departamento_nombre,
                      metros: inmueble.metros_cuadrados,
                      precio: oferta.precio,
                    })}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      fetch(`/api/ofertas/${oferta.id}/whatsapp`, { method: 'POST' }).catch(() => {})
                    }}
                    className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#1dbc59] transition-colors self-start"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Contactar por WhatsApp
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
