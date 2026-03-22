import { getBookingConfig } from '@/actions/settings'
import { BookingSettingsPanel } from '@/features/settings/components/BookingSettingsPanel'
import { Settings } from 'lucide-react'

export const metadata = { title: 'Configuración — VitalDent' }

export default async function SettingsPage() {
  const config = await getBookingConfig()

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-500">Administra tu página de reservas pública</p>
        </div>
        <a
          href="/book"
          target="_blank"
          className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
        >
          Ver página pública ↗
        </a>
      </div>

      <BookingSettingsPanel
        initialServices={config.services}
        initialSettings={config.settings}
        clinicId={config.clinicId ?? ''}
      />
    </div>
  )
}
