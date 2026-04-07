import { getEmpresasAdmin } from '@/lib/supabase/queries/admin'
import { EmpresasAdminClient } from '@/components/admin/EmpresasAdminClient'

export default async function EmpresasAdminPage() {
  const empresas = await getEmpresasAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2B2B2B]">Gestión de Empresas</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Administra el estado de todas las empresas registradas
        </p>
      </div>
      <EmpresasAdminClient empresas={empresas} />
    </div>
  )
}
