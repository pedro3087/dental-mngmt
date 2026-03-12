import { DashboardBento } from '@/features/dashboard/components/DashboardBento'
import { getUpcomingAppointments, getDashboardStats } from '@/actions/agenda'

export const metadata = {
  title: 'VitalDent'
}

export const revalidate = 0 // Opt-out of caching for real-time dashboard data

export default async function DashboardPage() {
  const { data: upcomingAppointments } = await getUpcomingAppointments()
  const stats = await getDashboardStats()
  
  const nextAppointment = upcomingAppointments && upcomingAppointments.length > 0 
    ? upcomingAppointments[0] 
    : null

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard General</h2>
        <div className="flex items-center space-x-2">
          {/* Asumimos que podemos personalizar esto después con el perfil del usuario autenticado */}
          <p className="text-sm text-gray-500">Bienvenido de nuevo</p>
        </div>
      </div>
      <DashboardBento 
        nextAppointment={nextAppointment} 
        stats={stats} 
      />
    </div>
  )
}
