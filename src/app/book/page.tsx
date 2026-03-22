import { BookingPage } from '@/features/booking/components/BookingPage'

export const metadata = { title: 'Agenda tu Cita — VitalDent' }

// Clinic config — single clinic for now
const CLINIC = {
  id:      'e94a8c0d-174c-44b2-89c3-8d52483f15d3',
  name:    'VitalDent',
  phone:   '+52 55 1234 5678',
  address: 'Ciudad de México, CDMX',
}

export default function BookPage() {
  return <BookingPage clinic={CLINIC} />
}
