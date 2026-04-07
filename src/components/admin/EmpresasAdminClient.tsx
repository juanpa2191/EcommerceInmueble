'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { aprobarEmpresa, suspenderEmpresa, reactivarEmpresa } from '@/lib/actions/admin'
import type { EmpresaAdmin } from '@/lib/supabase/queries/admin'

type Tab = 'todas' | 'pendientes' | 'aprobadas' | 'inactivas'

const tabs: { id: Tab; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'pendientes', label: 'Pendientes' },
  { id: 'aprobadas', label: 'Aprobadas' },
  { id: 'inactivas', label: 'Inactivas' },
]

interface Props {
  empresas: EmpresaAdmin[]
}

export function EmpresasAdminClient({ empresas }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('todas')

  const filtered = empresas.filter((e) => {
    if (activeTab === 'todas') return true
    if (activeTab === 'pendientes') return e.estado === 'pendiente'
    if (activeTab === 'aprobadas') return e.estado === 'aprobada'
    if (activeTab === 'inactivas') return e.estado === 'inactiva'
    return true
  })

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-[#D9D9D9] bg-[#F5F5F5] p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-white text-[#1F3A5F] shadow-sm'
                : 'text-[#6B6B6B] hover:text-[#2B2B2B]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-[#D9D9D9] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#D9D9D9] bg-[#F5F5F5] text-left">
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Nombre</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">NIT</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Correo</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Encargado</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Ofertas</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Estado</th>
                <th className="px-4 py-3 font-medium text-[#6B6B6B]">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]">
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm text-[#6B6B6B]"
                  >
                    No hay empresas en esta categoría
                  </td>
                </tr>
              ) : (
                filtered.map((empresa) => (
                  <EmpresaRow key={empresa.id} empresa={empresa} />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function estadoBadge(estado: EmpresaAdmin['estado']) {
  switch (estado) {
    case 'pendiente':
      return (
        <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
          Pendiente
        </span>
      )
    case 'aprobada':
      return (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
          Aprobada
        </span>
      )
    case 'inactiva':
      return (
        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
          Inactiva
        </span>
      )
  }
}

function EmpresaRow({ empresa }: { empresa: EmpresaAdmin }) {
  const [isPending, startTransition] = useTransition()

  function handleAprobar() {
    startTransition(async () => {
      const result = await aprobarEmpresa(empresa.id)
      if (result.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success(`"${empresa.nombre}" aprobada`)
      }
    })
  }

  function handleSuspender() {
    startTransition(async () => {
      const result = await suspenderEmpresa(empresa.id)
      if (result.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success(`"${empresa.nombre}" suspendida`)
      }
    })
  }

  function handleReactivar() {
    startTransition(async () => {
      const result = await reactivarEmpresa(empresa.id)
      if (result.error) {
        toast.error('Error: ' + result.error)
      } else {
        toast.success(`"${empresa.nombre}" reactivada`)
      }
    })
  }

  return (
    <tr className="hover:bg-[#F5F5F5]">
      <td className="px-4 py-3 font-medium text-[#2B2B2B]">{empresa.nombre}</td>
      <td className="px-4 py-3 text-[#6B6B6B]">{empresa.nit}</td>
      <td className="px-4 py-3 text-[#6B6B6B]">{empresa.correo}</td>
      <td className="px-4 py-3 text-[#6B6B6B]">{empresa.encargado_nombre}</td>
      <td className="px-4 py-3 text-[#6B6B6B]">{empresa.total_ofertas}</td>
      <td className="px-4 py-3">{estadoBadge(empresa.estado)}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {empresa.estado === 'pendiente' && (
            <>
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
                onClick={handleSuspender}
                className="border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                Rechazar
              </Button>
            </>
          )}
          {empresa.estado === 'aprobada' && (
            <Button
              size="sm"
              variant="outline"
              disabled={isPending}
              onClick={handleSuspender}
              className="border-yellow-400 text-yellow-700 hover:bg-yellow-50 disabled:opacity-50"
            >
              Suspender
            </Button>
          )}
          {empresa.estado === 'inactiva' && (
            <Button
              size="sm"
              disabled={isPending}
              onClick={handleReactivar}
              className="bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
            >
              Reactivar
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
