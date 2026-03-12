import { getUpcomingAppointments } from '@/actions/agenda'
import { AgendaClientView } from '@/features/agenda/components/AgendaClientView'

export const revalidate = 0

export default async function AgendaPage() {
  const { data: appointments } = await getUpcomingAppointments()

  return <AgendaClientView initialAppointments={appointments || []} />
}
