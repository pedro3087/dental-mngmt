'use client'

import { useState } from 'react'
import { Appointment } from '@/types/database'
import { motion } from 'framer-motion'
import { Clock, User, Phone, Edit2, MessageCircle, FileText } from 'lucide-react'
import Link from 'next/link'

// Simple helper para formatear horas
function formatTime(isoString: string) {
  const date = new Date(isoString)
  return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export function AgendaTimeline({ initialAppointments }: { initialAppointments: any[] }) {
  const [appointments, setAppointments] = useState(initialAppointments)

  if (appointments.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Agenda Libre</h3>
        <p className="text-gray-500 mt-1">No hay citas programadas para el día de hoy.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-gray-100">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <span>Próximas Citas</span>
          <span className="bg-blue-100 text-blue-700 text-xs py-1 px-2 rounded-full font-bold">
            {appointments.length} hoy
          </span>
        </h3>
      </div>

      <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
        {appointments.map((apt, i) => {
          const isUrgent = new Date(apt.appointment_date).getTime() - Date.now() < 3600000 // Menos de 1h
          
          return (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={apt.id} 
              className="relative pl-8"
            >
              {/* Timeline dot */}
              <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}`}></div>
              
              <div className="bg-gray-50 hover:bg-blue-50/50 transition-colors border border-gray-100 rounded-2xl p-5 shadow-sm group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Info Principal */}
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-gray-900">{formatTime(apt.appointment_date)}</span>
                      <span className="text-sm font-semibold text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                        {apt.duration_minutes} min
                      </span>
                      {apt.whatsapp_status === 'replied' && (
                        <span className="flex items-center text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-full">
                          <MessageCircle className="w-3 h-3 mr-1" /> Confirmado
                        </span>
                      )}
                    </div>
                    
                    <Link href={`/clinical/${apt.patient_id}`} className="text-xl font-bold text-gray-900 flex items-center gap-2 hover:text-blue-600 transition-colors">
                      <User className="w-5 h-5 text-gray-400" />
                      {apt.patients?.first_name} {apt.patients?.last_name}
                    </Link>
                    
                    <p className="text-gray-600 mt-2 text-sm">{apt.notes || 'Ninguna nota agregada'}</p>
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex space-x-2">
                      <Link href={`/clinical/${apt.patient_id}`} className="bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2" title="Abrir expediente">
                        <FileText className="w-4 h-4" /> Expediente
                      </Link>
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Editar cita">
                        <Edit2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-sm font-medium text-gray-500 flex items-center gap-1 mt-auto">
                      <Phone className="w-4 h-4" /> {apt.patients?.phone}
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
