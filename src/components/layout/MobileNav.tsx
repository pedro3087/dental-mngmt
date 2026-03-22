'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LayoutDashboard, CalendarDays, FileText, Receipt, Box, Bot, Users, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/hooks/useAuth'
import { signout } from '@/actions/auth'

const routes = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', color: 'text-sky-500', roles: ['doctor', 'receptionist', 'admin'] },
  { label: 'Agenda', icon: CalendarDays, href: '/agenda', color: 'text-violet-500', roles: ['doctor', 'receptionist', 'admin'] },
  { label: 'Pacientes', icon: Users, href: '/pacientes', color: 'text-blue-400', roles: ['doctor', 'receptionist', 'admin'] },
  { label: 'Clínico', icon: FileText, href: '/clinical', color: 'text-pink-700', roles: ['doctor', 'admin'] },
  { label: 'Facturación', icon: Receipt, href: '/billing', color: 'text-emerald-500', roles: ['doctor', 'receptionist', 'admin'] },
  { label: 'Inventario', icon: Box, href: '/inventory', color: 'text-orange-500', roles: ['doctor', 'receptionist', 'admin'] },
  { label: 'AI Copilot', icon: Bot, href: '/ai-copilot', color: 'text-zinc-400', roles: ['doctor', 'admin'] },
  { label: 'Configuración', icon: Settings, href: '/settings', color: 'text-gray-400', roles: ['doctor', 'admin'] },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { role } = useAuth()

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const visibleRoutes = role ? routes.filter(r => r.roles.includes(role)) : []

  return (
    <>
      {/* Top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-gray-900 text-white">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
            <span className="text-base font-bold">V</span>
          </div>
          <span className="text-lg font-bold">VitalDent</span>
        </Link>
        <button onClick={() => setOpen(true)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div className={cn(
        'md:hidden fixed top-0 left-0 z-50 h-full w-72 bg-gray-900 text-white flex flex-col transition-transform duration-300 ease-in-out',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-4 h-14 border-b border-white/10">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <span className="text-base font-bold">V</span>
            </div>
            <span className="text-lg font-bold">VitalDent</span>
          </Link>
          <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleRoutes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'flex w-full items-center rounded-lg p-3 text-sm font-medium transition hover:bg-white/10 hover:text-white',
                pathname === route.href ? 'bg-white/10 text-white' : 'text-zinc-400'
              )}
            >
              <route.icon className={cn('mr-3 h-5 w-5', route.color)} />
              {route.label}
            </Link>
          ))}
        </div>

        <div className="px-3 pb-6">
          <form action={signout}>
            <button
              type="submit"
              className="group flex w-full items-center rounded-lg p-3 text-sm font-medium text-zinc-400 transition hover:bg-white/10 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5 text-zinc-400 group-hover:text-red-400" />
              Cerrar sesión
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
