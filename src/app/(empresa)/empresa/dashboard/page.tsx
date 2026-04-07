import { getDashboardMetricas } from '@/lib/supabase/queries/empresa'
import { formatPrecio } from '@/lib/utils/format'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Building2,
  Eye,
  MessageCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Pencil,
  AlertTriangle,
} from 'lucide-react'

function EstadoBadge({ estado }: { estado: string }) {
  if (estado === 'aprobada') {
    return (
      <Badge className="bg-green-100 text-green-800 border-green-200">
        <CheckCircle2 className="size-3" />
        Aprobada
      </Badge>
    )
  }
  if (estado === 'pendiente') {
    return (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
        <Clock className="size-3" />
        Pendiente
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-100 text-red-800 border-red-200">
      <XCircle className="size-3" />
      Suspendida
    </Badge>
  )
}

function MetricCard({
  label,
  value,
  icon: Icon,
  colorClass,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  colorClass: string
}) {
  return (
    <div className="rounded-xl border border-[#D9D9D9] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-[#6B6B6B]">{label}</p>
        <div className={`flex size-9 items-center justify-center rounded-lg ${colorClass}`}>
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-[#2B2B2B]">{value}</p>
    </div>
  )
}

export default async function DashboardPage() {
  const metricas = await getDashboardMetricas()

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#2B2B2B]">
            Bienvenido
            {metricas.empresa?.nombre ? `, ${metricas.empresa.nombre}` : ''}
          </h1>
          <p className="mt-1 text-sm text-[#6B6B6B]">
            Resumen de tu actividad en la plataforma
          </p>
        </div>
        {metricas.empresa && (
          <EstadoBadge estado={metricas.empresa.estado} />
        )}
      </div>

      {/* Banner de cuenta pendiente */}
      {metricas.empresa?.estado === 'pendiente' && (
        <div className="flex items-start gap-3 rounded-xl border border-yellow-300 bg-yellow-50 px-5 py-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-yellow-600" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              Tu cuenta está pendiente de aprobación
            </p>
            <p className="mt-0.5 text-sm text-yellow-700">
              Podrás publicar inmuebles una vez que un administrador apruebe tu
              empresa. Te notificaremos por correo.
            </p>
          </div>
        </div>
      )}

      {/* Tarjetas de métricas */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Total ofertas"
          value={metricas.totalOfertas}
          icon={Building2}
          colorClass="bg-blue-100 text-blue-700"
        />
        <MetricCard
          label="Ofertas activas"
          value={metricas.ofertasActivas}
          icon={TrendingUp}
          colorClass="bg-green-100 text-green-700"
        />
        <MetricCard
          label="Vistas totales"
          value={metricas.totalVistas.toLocaleString('es-CO')}
          icon={Eye}
          colorClass="bg-indigo-100 text-indigo-700"
        />
        <MetricCard
          label="Clicks WhatsApp"
          value={metricas.totalClicksWhatsapp.toLocaleString('es-CO')}
          icon={MessageCircle}
          colorClass="bg-[#25D366]/10 text-[#25D366]"
        />
      </div>

      {/* Tabla de últimas ofertas */}
      <div className="rounded-xl border border-[#D9D9D9] bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-[#D9D9D9] px-5 py-4">
          <h2 className="text-base font-semibold text-[#2B2B2B]">
            Mis últimas ofertas
          </h2>
          <Link href="/empresa/inmuebles/nuevo">
            <Button size="sm" className="bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]">
              Nueva oferta
            </Button>
          </Link>
        </div>

        {metricas.ofertasRecientes.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <Building2 className="size-12 text-[#D9D9D9]" />
            <div>
              <p className="font-medium text-[#2B2B2B]">
                Aún no tienes ofertas publicadas
              </p>
              <p className="mt-1 text-sm text-[#6B6B6B]">
                Crea tu primera oferta para comenzar a recibir consultas
              </p>
            </div>
            <Link href="/empresa/inmuebles/nuevo">
              <Button
                size="sm"
                className="mt-2 bg-[#1F3A5F] text-white hover:bg-[#2E5C8A]"
              >
                Crear oferta
              </Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#D9D9D9] bg-[#F5F5F5]">
                  <th className="px-4 py-3 text-left font-medium text-[#6B6B6B]">
                    Matrícula
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B6B6B]">
                    Municipio
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B6B6B]">
                    Tipo
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B6B6B]">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-[#6B6B6B]">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[#6B6B6B]">
                    Vistas
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[#6B6B6B]">
                    WhatsApp
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-[#6B6B6B]">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {metricas.ofertasRecientes.map((oferta, idx) => (
                  <tr
                    key={oferta.id}
                    className={
                      idx < metricas.ofertasRecientes.length - 1
                        ? 'border-b border-[#D9D9D9]'
                        : ''
                    }
                  >
                    <td className="px-4 py-3 font-mono text-xs text-[#2B2B2B]">
                      {oferta.matricula || '-'}
                    </td>
                    <td className="px-4 py-3 text-[#2B2B2B]">
                      {oferta.municipio_nombre || '-'}
                    </td>
                    <td className="px-4 py-3 text-[#6B6B6B]">
                      {oferta.tipo_nombre || '-'}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#2B2B2B]">
                      {formatPrecio(oferta.precio)}
                    </td>
                    <td className="px-4 py-3">
                      {oferta.activo ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                          <span className="size-1.5 rounded-full bg-green-500" />
                          Activa
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                          <span className="size-1.5 rounded-full bg-gray-400" />
                          Inactiva
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-[#6B6B6B]">
                      <span className="flex items-center justify-end gap-1">
                        <Eye className="size-3.5" />
                        {oferta.vistas.toLocaleString('es-CO')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="flex items-center justify-end gap-1 text-[#25D366]">
                        <MessageCircle className="size-3.5" />
                        {oferta.clicks_whatsapp.toLocaleString('es-CO')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/empresa/inmuebles/${oferta.id}/editar`}>
                        <Button variant="ghost" size="icon-sm">
                          <Pencil className="size-3.5" />
                          <span className="sr-only">Editar</span>
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
