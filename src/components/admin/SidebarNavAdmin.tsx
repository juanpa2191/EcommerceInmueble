'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Building2,
  Activity,
  Image,
  Tag,
  MapPin,
  LogOut,
  Menu,
  X,
  ShieldCheck,
} from 'lucide-react'
import { cerrarSesion } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState } from 'react'

const navItems = [
  {
    label: 'Dashboard',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Empresas',
    href: '/admin/empresas',
    icon: Building2,
  },
  {
    label: 'Actividades',
    href: '/admin/actividades',
    icon: Activity,
  },
  {
    label: 'Hero images',
    href: '/admin/hero',
    icon: Image,
  },
  {
    label: 'Tipos',
    href: '/admin/tipos',
    icon: Tag,
  },
  {
    label: 'Municipios',
    href: '/admin/geografico',
    icon: MapPin,
  },
]

function NavLinks({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive
                ? 'bg-[#1F3A5F] text-white'
                : 'text-[#2B2B2B] hover:bg-[#D9D9D9]'
            )}
          >
            <item.icon className="size-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function LogoutButton({ onClose }: { onClose?: () => void }) {
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    onClose?.()
    await cerrarSesion()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#2B2B2B] transition-colors hover:bg-[#D9D9D9] disabled:opacity-50"
    >
      <LogOut className="size-4 shrink-0" />
      {loading ? 'Cerrando...' : 'Cerrar sesión'}
    </button>
  )
}

function SidebarContent({ onClose }: { onClose?: () => void }) {
  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5">
        <div className="flex size-8 items-center justify-center rounded-lg bg-[#1F3A5F]">
          <ShieldCheck className="size-4 text-white" />
        </div>
        <span className="text-base font-semibold text-[#1F3A5F]">
          Panel Admin
        </span>
      </div>

      <div className="h-px bg-[#D9D9D9] mx-3" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4">
        <NavLinks onClose={onClose} />
      </div>

      <div className="h-px bg-[#D9D9D9] mx-3" />

      {/* Logout */}
      <div className="px-3 py-4">
        <LogoutButton onClose={onClose} />
      </div>
    </div>
  )
}

export function DesktopSidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r border-[#D9D9D9] bg-[#F5F5F5] md:flex md:flex-col">
      <SidebarContent />
    </aside>
  )
}

export function MobileHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="flex items-center gap-3 border-b border-[#D9D9D9] bg-[#F5F5F5] px-4 py-3 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          render={
            <Button variant="ghost" size="icon" className="-ml-1" />
          }
          aria-label="Abrir menú"
        >
          <Menu className="size-5" />
        </SheetTrigger>
        <SheetContent side="left" showCloseButton={false} className="w-60 p-0 bg-[#F5F5F5]">
          <SheetHeader className="sr-only">
            <SheetTitle>Menú de navegación</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-[#1F3A5F]">
                  <ShieldCheck className="size-4 text-white" />
                </div>
                <span className="text-base font-semibold text-[#1F3A5F]">
                  Panel Admin
                </span>
              </div>
              <SheetClose
                render={
                  <Button variant="ghost" size="icon-sm" className="shrink-0" />
                }
                aria-label="Cerrar menú"
              >
                <X className="size-4" />
              </SheetClose>
            </div>
            <div className="h-px bg-[#D9D9D9] mx-3" />
            <div className="flex-1 overflow-y-auto py-4">
              <NavLinks onClose={() => setOpen(false)} />
            </div>
            <div className="h-px bg-[#D9D9D9] mx-3" />
            <div className="px-3 py-4">
              <LogoutButton onClose={() => setOpen(false)} />
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2">
        <div className="flex size-6 items-center justify-center rounded bg-[#1F3A5F]">
          <ShieldCheck className="size-3 text-white" />
        </div>
        <span className="text-sm font-semibold text-[#1F3A5F]">
          Panel Admin
        </span>
      </div>
    </header>
  )
}
