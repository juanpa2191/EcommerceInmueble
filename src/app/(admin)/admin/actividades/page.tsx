import { getActividadesAdmin } from '@/lib/supabase/queries/admin'
import { ActividadesAdminClient } from '@/components/admin/ActividadesAdminClient'

export default async function ActividadesAdminPage() {
  const actividades = await getActividadesAdmin()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#2B2B2B]">Gestión de Actividades</h1>
        <p className="mt-1 text-sm text-[#6B6B6B]">
          Administra las actividades internas y de entorno disponibles
        </p>
      </div>
      <ActividadesAdminClient actividades={actividades} />
    </div>
  )
}
