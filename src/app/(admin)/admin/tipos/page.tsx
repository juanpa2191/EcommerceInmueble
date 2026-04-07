import { getTiposAdmin } from '@/lib/supabase/queries/admin'
import { TiposAdminClient } from '@/components/admin/TiposAdminClient'

export default async function TiposAdminPage() {
  const tipos = await getTiposAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2B2B2B]">Tipos de Inmueble</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Gestiona los tipos de inmueble disponibles en la plataforma
        </p>
      </div>
      <TiposAdminClient tipos={tipos} />
    </div>
  )
}
