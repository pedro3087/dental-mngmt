import {
  getBookingConfig,
  getClinicProfile,
  getBillingConfig,
  getTeamMembers,
  getNotificationSettings,
  getInventorySettings,
  getAiSettings,
} from '@/actions/settings'
import { BookingSettingsPanel }   from '@/features/settings/components/BookingSettingsPanel'
import { ClinicProfilePanel }     from '@/features/settings/components/ClinicProfilePanel'
import { BillingSettingsPanel }   from '@/features/settings/components/BillingSettingsPanel'
import { TeamPanel }              from '@/features/settings/components/TeamPanel'
import { NotificationsPanel }     from '@/features/settings/components/NotificationsPanel'
import { InventorySettingsPanel } from '@/features/settings/components/InventorySettingsPanel'
import { AiSettingsPanel }        from '@/features/settings/components/AiSettingsPanel'
import { SettingsTabs }           from '@/features/settings/components/SettingsTabs'
import { Settings }               from 'lucide-react'

export const metadata = { title: 'Configuración — VitalDent' }

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'reservas' } = await searchParams

  const [config, clinicProfile, billingConfig, teamMembers, notifSettings, invSettings, aiSettings] =
    await Promise.all([
      getBookingConfig(),
      getClinicProfile(),
      getBillingConfig(),
      getTeamMembers().catch(() => [] as Awaited<ReturnType<typeof getTeamMembers>>),
      getNotificationSettings().catch(() => null),
      getInventorySettings().catch(() => null),
      getAiSettings().catch(() => null),
    ])

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-500">Administra tu clínica</p>
        </div>
        {tab === 'reservas' && (
          <a
            href="/book"
            target="_blank"
            className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
          >
            Ver página pública ↗
          </a>
        )}
      </div>

      <SettingsTabs activeTab={tab} />

      <div className="mt-6">
        {tab === 'reservas' && (
          <BookingSettingsPanel
            initialServices={config.services}
            initialSettings={config.settings}
            clinicId={config.clinicId ?? ''}
          />
        )}
        {tab === 'clinica' && (
          <ClinicProfilePanel initial={clinicProfile} />
        )}
        {tab === 'facturacion' && (
          <BillingSettingsPanel
            initialBilling={billingConfig.billing}
            initialPac={billingConfig.pac}
          />
        )}
        {tab === 'equipo' && (
          <TeamPanel initialMembers={teamMembers} />
        )}
        {tab === 'notificaciones' && (
          <NotificationsPanel initial={notifSettings} />
        )}
        {tab === 'inventario' && (
          <InventorySettingsPanel initial={invSettings} />
        )}
        {tab === 'ia' && (
          <AiSettingsPanel initial={aiSettings} />
        )}
      </div>
    </div>
  )
}
