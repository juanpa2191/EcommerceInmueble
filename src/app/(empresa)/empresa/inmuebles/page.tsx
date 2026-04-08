import Link from 'next/link'
import { PlusSquare, Pencil, Eye, MessageCircle } from 'lucide-react'
import { getMisOfertas } from '@/lib/supabase/queries/empresa'
import { formatPrecio } from '@/lib/utils/format'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default async function MisInmueblesPage() {
  const ofertas = await getMisOfertas()

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2B2B2B]">Mis inmuebles</h1>
          <p className="text-sm text-[#6B6B6B]">
            {ofertas.length} {ofertas.length === 1 ? 'oferta publicada' : 'ofertas publicadas'}
          </p>
        </div>
        <Button asChild className="bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]">
          <Link href="/empresa/inmuebles/nuevo">
            <PlusSquare className="size-4" />
            Nueva oferta
          </Link>
        </Button>
      </div>

      {/* Tabla */}
      {ofertas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[#D9D9D9] bg-white py-20 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-[#F5F5F5]">
            <PlusSquare className="size-6 text-[#6B6B6B]" />
          </div>
          <p className="mt-4 text-base font-medium text-[#2B2B2B]">
            Aún no tienes ofertas publicadas
          </p>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Crea tu primera oferta para que los compradores puedan encontrarte
          </p>
          <Button asChild className="mt-6 bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]">
            <Link href="/empresa/inmuebles/nuevo">
              <PlusSquare className="size-4" />
              Crear primera oferta
            </Link>
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#D9D9D9] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D9D9D9] bg-[#F5F5F5] text-left">
                  <th className="px-4 py-3 font-medium text-[#6B6B6B]">Matrícula</th>
                  <th className="px-4 py-3 font-medium text-[#6B6B6B]">Tipo</th>
                  <th className="px-4 py-3 font-medium text-[#6B6B6B]">Municipio</th>
                  <th className="px-4 py-3 font-medium text-[#6B6B6B]">Precio</th>
                  <th className="px-4 py-3 font-medium text-[#6B6B6B]">Estado</th>
                  <th className="px-4 py-3 font-medium text-[#6B6B6B]">
                    <span className="flex items-center gap-1">
                      <Eye className="size-3.5" /> Vistas
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium text-[#6B6B6B]">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="size-3.5" /> WhatsApp
                    </span>
                  </th>
                  <th className="px-4 py-3 font-medium text-[#6B6B6B]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D9D9D9]">
                {ofertas.map((oferta) => (
                  <tr key={oferta.id} className="hover:bg-[#F5F5F5]">
                    <td className="px-4 py-3 font-mono text-xs text-[#2B2B2B]">
                      {oferta.matricula}
                    </td>
                    <td className="px-4 py-3 text-[#2B2B2B]">{oferta.tipo_nombre}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{oferta.municipio_nombre}</td>
                    <td className="px-4 py-3 font-medium text-[#2B2B2B]">
                      {formatPrecio(oferta.precio)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          oferta.activo
                            ? 'bg-green-100 text-green-800 hover:bg-green-100'
                            : 'bg-[#F5F5F5] text-[#6B6B6B] hover:bg-[#F5F5F5]'
                        }
                      >
                        {oferta.activo ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{oferta.vistas}</td>
                    <td className="px-4 py-3 text-[#6B6B6B]">{oferta.clicks_whatsapp}</td>
                    <td className="px-4 py-3">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/empresa/inmuebles/${oferta.id}/editar`}>
                          <Pencil className="size-3.5" />
                          Editar
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
