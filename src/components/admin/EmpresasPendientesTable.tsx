'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { aprobarEmpresa, suspenderEmpresa } from '@/lib/actions/admin'
import type { EmpresaPendiente } from '@/lib/supabase/queries/admin'

interface Props {
  empresas: EmpresaPendiente[]
}

export function EmpresasPendientesTable({ empresas }: Props) {
  if (empresas.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[#D9D9D9] bg-white py-12 text-center">
        <span className="text-3xl">&#10003;</span>
        <p className="mt-2 text-sm font-medium text-[#2B2B2B]">Todo al día</p>
        <p className="mt-1 text-xs text-[#6B6B6B]">
          No hay empresas pendientes de aprobación
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[#D9D9D9] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#D9D9D9] bg-[#F5F5F5] text-left">
              <th className="px-4 py-3 font-medium text-[#6B6B6B]">Empresa</th>
              <th className="px-4 py-3 font-medium text-[#6B6B6B]">NIT</th>
              <th className="px-4 py-3 font-medium text-[#6B6B6B]">Correo</th>
              <th className="px-4 py-3 font-medium text-[#6B6B6B]">Encargado</th>
              <th className="px-4 py-3 font-medium text-[#6B6B6B]">Fecha</th>
              <th className="px-4 py-3 font-medium text-[#6B6B6B]">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D9D9D9]">
            {empresas.map((empresa) => (
              <EmpresaRow key={empresa.id} empresa={empresa} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EmpresaRow({ empresa }: { empresa: EmpresaPendiente }) {
  const [isPending, startTransition] = useTransition()

  function handleAprobar() {
    startTransition(async () => {
      const result = await aprobarEmpresa(empresa.id)
      if (result.error) {
        toast.error('Error al aprobar empresa: ' + result.error)
      } else {
        toast.success(`Empresa "${empresa.nombre}" aprobada`)
      }
    })
  }

  function handleRechazar() {
    startTransition(async () => {
      const result = await suspenderEmpresa(empresa.id)
      if (result.error) {
        toast.error('Error al rechazar empresa: ' + result.error)
      } else {
        toast.success(`Empresa "${empresa.nombre}" rechazada`)
      }
    })
  }

  const fecha = new Date(empresa.created_at).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  return (
    <tr className="hover:bg-[#F5F5F5]">
      <td className="px-4 py-3 font-medium text-[#2B2B2B]">{empresa.nombre}</td>
      <td className="px-4 py-3 text-[#6B6B6B]">{empresa.nit}</td>
      <td className="px-4 py-3 text-[#6B6B6B]">{empresa.correo}</td>
      <td className="px-4 py-3 text-[#6B6B6B]">{empresa.encargado_nombre}</td>
      <td className="px-4 py-3 text-[#6B6B6B] whitespace-nowrap">{fecha}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={isPending}
            onClick={handleAprobar}
            className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
          >
            Aprobar
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={handleRechazar}
            className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Rechazar
          </Button>
        </div>
      </td>
    </tr>
  )
}
