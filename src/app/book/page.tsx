import { createClient } from '@supabase/supabase-js'
import { BookingPage } from '@/features/booking/components/BookingPage'

export const metadata = { title: 'Agenda tu Cita — VitalDent' }
export const revalidate = 60

const CLINIC_ID = 'e94a8c0d-174c-44b2-89c3-8d52483f15d3'

const supabasePublic = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const FALLBACK_SERVICES = [
  { id: 'consulta',       label: 'Consulta General',   emoji: '🦷', duration_min: 30,  description: 'Primera visita, revisión y diagnóstico completo', tag: null,      accent: 'blue' },
  { id: 'limpieza',       label: 'Limpieza Dental',    emoji: '✨', duration_min: 60,  description: 'Limpieza profunda y eliminación de sarro',         tag: 'Popular', accent: 'cyan' },
  { id: 'blanqueamiento', label: 'Blanqueamiento LED', emoji: '⚡', duration_min: 90,  description: 'Hasta 8 tonos más blanco en una sesión',           tag: 'Nuevo',   accent: 'amber' },
  { id: 'ortodoncia',     label: 'Ortodoncia',         emoji: '🔧', duration_min: 60,  description: 'Brackets, alineadores transparentes y ajustes',    tag: null,      accent: 'violet' },
  { id: 'extraccion',     label: 'Extracción',         emoji: '💊', duration_min: 45,  description: 'Extracción simple o quirúrgica sin dolor',          tag: null,      accent: 'rose' },
  { id: 'implante',       label: 'Implante Dental',    emoji: '🏆', duration_min: 120, description: 'Consulta y plan personalizado de implante',         tag: null,      accent: 'emerald' },
]

export default async function BookPage() {
  const [servicesRes, settingsRes] = await Promise.all([
    supabasePublic
      .from('booking_services')
      .select('*')
      .eq('clinic_id', CLINIC_ID)
      .eq('active', true)
      .order('order_index'),
    supabasePublic
      .from('booking_settings')
      .select('*')
      .eq('clinic_id', CLINIC_ID)
      .single(),
  ])

  const services = servicesRes.data ?? []
  const settings = settingsRes.data

  return (
    <BookingPage
      clinicId={CLINIC_ID}
      clinicName="VitalDent"
      clinicPhone="+52 55 1234 5678"
      clinicAddress="Ciudad de México, CDMX"
      services={services.length > 0 ? services : FALLBACK_SERVICES}
      startHour={settings?.start_hour ?? 9}
      endHour={settings?.end_hour ?? 19}
      slotInterval={settings?.slot_interval ?? 30}
      openDays={settings?.open_days ?? [1, 2, 3, 4, 5, 6]}
    />
  )
}
