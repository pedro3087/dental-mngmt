'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarDays, FileText, Receipt, Box, Bot, Users, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { signout } from '@/actions/auth'

const routes = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: 'text-sky-500',
    roles: ['doctor', 'receptionist', 'admin'] as const,
  },
  {
    label: 'Agenda',
    icon: CalendarDays,
    href: '/agenda',
    color: 'text-violet-500',
    roles: ['doctor', 'receptionist', 'admin'] as const,
  },
  {
    label: 'Pacientes',
    icon: Users,
    href: '/pacientes',
    color: 'text-blue-400',
    roles: ['doctor', 'receptionist', 'admin'] as const,
  },
  {
    label: 'Clínico',
    icon: FileText,
    href: '/clinical',
    color: 'text-pink-700',
    roles: ['doctor', 'admin'] as const,         // Recepcionista no tiene acceso
  },
  {
    label: 'Facturación',
    icon: Receipt,
    href: '/billing',
    color: 'text-emerald-500',
    roles: ['doctor', 'receptionist', 'admin'] as const,
  },
  {
    label: 'Inventario',
    icon: Box,
    href: '/inventory',
    color: 'text-orange-500',
    roles: ['doctor', 'receptionist', 'admin'] as const,
  },
  {
    label: 'AI Copilot',
    icon: Bot,
    href: '/ai-copilot',
    color: 'text-zinc-400',
    roles: ['doctor', 'admin'] as const,
  },
  {
    label: 'Configuración',
    icon: Settings,
    href: '/settings',
    color: 'text-gray-400',
    roles: ['admin'] as const,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { role } = useAuth()

  const visibleRoutes = role
    ? routes.filter(r => (r.roles as readonly string[]).includes(role))
    : routes  // Mientras carga, mostrar todas (el middleware ya protege el acceso)

  return (
    <div className="flex h-full flex-col space-y-4 bg-gray-900 py-4 text-white">
      <div className="flex flex-1 flex-col px-3 py-2">
        <Link href="/dashboard" className="mb-14 flex items-center pl-3">
          <div className="relative mr-4 h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-xl font-bold">V</span>
          </div>
          <h1 className="text-2xl font-bold">VitalDent</h1>
        </Link>
        <div className="space-y-1">
          {visibleRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'group flex w-full cursor-pointer justify-start rounded-lg p-3 text-sm font-medium transition hover:bg-white/10 hover:text-white',
                pathname === route.href ? 'bg-white/10 text-white' : 'text-zinc-400'
              )}
            >
              <div className="flex flex-1 items-center">
                <route.icon className={cn('mr-3 h-5 w-5', route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
      <div className="px-3 pb-4">
        <form action={signout}>
          <button
            type="submit"
            className="group flex w-full cursor-pointer justify-start rounded-lg p-3 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
          >
            <LogOut className="mr-3 h-5 w-5 text-zinc-400 group-hover:text-red-400" />
            Cerrar sesión
          </button>
        </form>
      </div>
    </div>
  )
}
