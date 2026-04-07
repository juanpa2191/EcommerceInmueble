import { getDepartamentosConMunicipios } from '@/lib/supabase/queries/admin'
import { GeograficoClient } from '@/components/admin/GeograficoClient'

export default async function GeograficoAdminPage() {
  const departamentos = await getDepartamentosConMunicipios()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2B2B2B]">Municipios y Departamentos</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Vista de los datos geográficos de Colombia disponibles en la plataforma
        </p>
      </div>
      <GeograficoClient departamentos={departamentos} />
    </div>
  )
}
