'use client'

import { Calendar, TrendingDown, Users, BellRing, ChevronRight, Activity, Smile } from 'lucide-react'
import { motion } from 'framer-motion'
import { Appointment } from '@/types/database'

interface DashboardBentoProps {
  nextAppointment?: Appointment | any | null
  stats?: {
    noShowRate: string
    totalAppointments: number
  } | null
}

export function DashboardBento({ nextAppointment, stats }: DashboardBentoProps) {
  // Calculamos los minutos faltantes si hay una cita próxima
  let minsToNext = null
  let isUrgent = false
  if (nextAppointment) {
    const diffMs = new Date(nextAppointment.appointment_date).getTime() - new Date().getTime()
    minsToNext = Math.round(diffMs / 60000)
    isUrgent = minsToNext <= 30 && minsToNext >= 0
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[220px]">
      
      {/* 1. Hero / Main Stats (3x2 LG, 2x2 MD) */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="md:col-span-2 md:row-span-2 lg:col-span-3 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-8 shadow-xl relative overflow-hidden flex flex-col justify-between"
      >
        <div className="absolute top-0 right-0 p-8 opacity-20">
          <Activity size={120} />
        </div>
        <div>
          <h2 className="text-white text-3xl font-bold mb-2">Ingresos del Mes</h2>
          <p className="text-blue-100/80 font-medium">Proyección de tratamientos a largo plazo</p>
        </div>
        <div className="mt-8">
          <span className="text-6xl font-extrabold text-white tracking-tight">$145K</span>
          <div className="flex items-center mt-3 text-emerald-300 font-semibold bg-white/10 w-fit px-3 py-1 rounded-full text-sm">
            <TrendingDown className="mr-1 h-4 w-4 rotate-180" />
            +12.5% vs último mes
          </div>
        </div>
      </motion.div>

      {/* 2. KPI: Ausentismo (1x1 LG/MD) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white border text-gray-900 border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">No-Shows</h3>
          <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
            <Users size={20} />
          </div>
        </div>
        <div>
          <span className="text-4xl font-bold tracking-tight text-emerald-600">{stats?.noShowRate || '0.0%'}</span>
          <p className="text-sm text-gray-500 mt-1">Meta: &lt; 5%  🎉</p>
        </div>
      </motion.div>

      {/* 3. Próxima Cita (2x1 LG, 1x2 MD) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="md:row-span-2 lg:row-span-1 lg:col-span-2 bg-gray-900 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h3 className="font-semibold text-gray-300 flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-blue-400" /> Próximo Paciente
          </h3>
          {nextAppointment ? (
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`}>
              {minsToNext && minsToNext > 0 ? `En ${minsToNext} min` : 'Ahora'}
            </span>
          ) : (
            <span className="text-xs bg-gray-700 px-2 py-1 rounded-full font-bold">Sin citas</span>
          )}
        </div>
        <div className="relative z-10">
          <p className="text-2xl font-bold">
            {nextAppointment ? `${nextAppointment.patients?.first_name} ${nextAppointment.patients?.last_name}` : 'Excelente'}
          </p>
          <p className="text-gray-400 mt-1">
            {nextAppointment ? nextAppointment.notes || 'Consulta General' : 'Tienes tu día libre o terminaste'}
          </p>
        </div>
        <div className="mt-4 flex gap-2 relative z-10">
          <button className="flex-1 bg-white/10 hover:bg-white/20 transition-colors text-white py-2 rounded-xl text-sm font-medium" disabled={!nextAppointment}>
            Ver Expediente
          </button>
        </div>
      </motion.div>

      {/* 4. Notificaciones / Recordatorios Automáticos (2x1 LG) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="lg:col-span-2 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 hover:border-blue-200 transition-colors group cursor-pointer"
      >
        <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
          <BellRing size={28} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 text-lg">WhatsApp Bot</h3>
          <p className="text-gray-500 text-sm h-10 overflow-hidden">
            {nextAppointment?.whatsapp_status === 'replied' ? '¡El paciente confirmó su cita!' : 'Esperando confirmaciones...'}
          </p>
        </div>
        <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition-colors" />
      </motion.div>

      {/* 5. Tracker de Sonrisa (1x1 LG) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="bg-amber-100 rounded-3xl p-6 flex flex-col justify-center items-center text-center shadow-sm hover:bg-amber-200 transition-colors cursor-pointer"
      >
        <div className="p-3 bg-amber-500 text-white rounded-full mb-3 shadow-lg">
          <Smile size={32} />
        </div>
        <h3 className="font-bold text-gray-900">Tracker de Sonrisa</h3>
        <p className="text-amber-800 text-sm mt-1 text-center">70% interacción pac.</p>
      </motion.div>

      {/* 6. Footer del Grid (Full width) */}
      <div className="col-span-full bg-white border border-gray-100 rounded-3xl p-4 flex items-center justify-between shadow-sm">
        <p className="text-sm font-medium text-gray-500 flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          Sistema CFDI 4.0 Conectado
        </p>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700">Ver Reporte Mensual &rarr;</button>
      </div>
    </div>
  )
}

