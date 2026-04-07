import { getAdminDashboard } from '@/lib/supabase/queries/admin'
import { EmpresasPendientesTable } from '@/components/admin/EmpresasPendientesTable'

export default async function AdminDashboardPage() {
  const data = await getAdminDashboard()

  const metrics = [
    {
      label: 'Total empresas',
      value: data.totalEmpresas,
      highlight: false,
    },
    {
      label: 'Pendientes de aprobación',
      value: data.empresasPendientes,
      highlight: data.empresasPendientes > 0,
    },
    {
      label: 'Empresas aprobadas',
      value: data.empresasAprobadas,
      highlight: false,
    },
    {
      label: 'Total predios',
      value: data.totalPredios,
      highlight: false,
    },
    {
      label: 'Total ofertas',
      value: data.totalOfertas,
      highlight: false,
    },
    {
      label: 'Ofertas activas',
      value: data.ofertasActivas,
      highlight: false,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[#2B2B2B]">Panel de Administración</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Resumen general del sistema
        </p>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {metrics.map((m) => (
          <div
            key={m.label}
            className={[
              'rounded-xl border p-4',
              m.highlight
                ? 'border-yellow-300 bg-yellow-50'
                : 'border-[#D9D9D9] bg-white',
            ].join(' ')}
          >
            <p
              className={[
                'text-xs font-medium',
                m.highlight ? 'text-yellow-700' : 'text-[#6B6B6B]',
              ].join(' ')}
            >
              {m.label}
            </p>
            <p
              className={[
                'mt-2 text-3xl font-bold',
                m.highlight ? 'text-yellow-800' : 'text-[#1F3A5F]',
              ].join(' ')}
            >
              {m.value}
            </p>
          </div>
        ))}
      </div>

      {/* Tabla de pendientes */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[#2B2B2B]">
          Empresas pendientes de aprobación
        </h2>
        <EmpresasPendientesTable empresas={data.empresasPendientesLista} />
      </div>
    </div>
  )
}
