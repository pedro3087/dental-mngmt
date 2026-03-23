import { Suspense } from 'react'
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
import { PageLoader }             from '@/shared/components/PageLoader'
import { Settings }               from 'lucide-react'

export const metadata = { title: 'Configuración — VitalDent' }

async function BookingTab() {
  const config = await getBookingConfig()
  return <BookingSettingsPanel initialServices={config.services} initialSettings={config.settings} clinicId={config.clinicId ?? ''} />
}

async function ClinicTab() {
  const clinicProfile = await getClinicProfile()
  return <ClinicProfilePanel initial={clinicProfile} />
}

async function BillingTab() {
  const billingConfig = await getBillingConfig()
  return <BillingSettingsPanel initialBilling={billingConfig.billing} initialPac={billingConfig.pac} />
}

async function TeamTab() {
  const teamMembers = await getTeamMembers().catch(() => [] as Awaited<ReturnType<typeof getTeamMembers>>)
  return <TeamPanel initialMembers={teamMembers} />
}

async function NotificationsTab() {
  const notifSettings = await getNotificationSettings().catch(() => null)
  return <NotificationsPanel initial={notifSettings} />
}

async function InventoryTab() {
  const invSettings = await getInventorySettings().catch(() => null)
  return <InventorySettingsPanel initial={invSettings} />
}

async function AiTab() {
  const aiSettings = await getAiSettings().catch(() => null)
  return <AiSettingsPanel initial={aiSettings} />
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab = 'reservas' } = await searchParams

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

      <div className="mt-6 min-h-[200px]">
        <Suspense key={tab} fallback={<PageLoader />}>
          {tab === 'reservas'       && <BookingTab />}
          {tab === 'clinica'        && <ClinicTab />}
          {tab === 'facturacion'    && <BillingTab />}
          {tab === 'equipo'         && <TeamTab />}
          {tab === 'notificaciones' && <NotificationsTab />}
          {tab === 'inventario'     && <InventoryTab />}
          {tab === 'ia'             && <AiTab />}
        </Suspense>
      </div>
    </div>
  )
}
