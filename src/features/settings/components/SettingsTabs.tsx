'use client'

import Link from 'next/link'
import { CalendarDays, Building2, Receipt } from 'lucide-react'

const TABS = [
  { id: 'reservas',     label: 'Reservas Online', icon: CalendarDays },
  { id: 'clinica',      label: 'Clínica',          icon: Building2 },
  { id: 'facturacion',  label: 'Facturación',       icon: Receipt },
]

export function SettingsTabs({ activeTab }: { activeTab: string }) {
  return (
    <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-fit">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id
        return (
          <Link
            key={id}
            href={`/settings?tab=${id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              active
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </Link>
        )
      })}
    </div>
  )
}
