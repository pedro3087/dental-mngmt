import { getAppointmentsByDate, fetchAppointmentsByDate } from '@/actions/agenda'
import { AgendaClientView } from '@/features/agenda/components/AgendaClientView'

export const revalidate = 0

export default async function AgendaPage() {
  const today = new Date().toISOString().split('T')[0]
  const { data: appointments } = await getAppointmentsByDate(today).catch(() => ({ data: null }))

  return (
    <AgendaClientView
      initialAppointments={appointments ?? []}
      onFetchDay={fetchAppointmentsByDate}
    />
  )
}
