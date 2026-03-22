'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, User, Phone, Edit2, FileText, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import { updateAppointmentStatus } from '@/actions/agenda'
import type { Appointment } from '@/types/database'

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  scheduled:  { label: 'Programada',  color: 'bg-blue-100 text-blue-700' },
  confirmed:  { label: 'Confirmada',  color: 'bg-emerald-100 text-emerald-700' },
  completed:  { label: 'Completada',  color: 'bg-gray-100 text-gray-600' },
  cancelled:  { label: 'Cancelada',   color: 'bg-red-100 text-red-600' },
  no_show:    { label: 'No asistió',  color: 'bg-orange-100 text-orange-700' },
}

export function AgendaTimeline({ initialAppointments }: { initialAppointments: Appointment[] }) {
  const [appointments, setAppointments] = useState(initialAppointments)

  async function handleStatusChange(id: string, status: string) {
    // Optimistic update
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: status as Appointment['status'] } : a))
    await updateAppointmentStatus(id, status)
  }

  if (appointments.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-bold text-gray-900">Agenda Libre</h3>
        <p className="text-gray-500 mt-1 text-sm">No hay citas para este día.</p>
      </div>
    )
  }

  return (
    <div className="relative border-l-2 border-gray-100 ml-4 space-y-6 pb-4">
      {appointments.map((apt, i) => {
        const minutesUntil = (new Date(apt.scheduled_at).getTime() - Date.now()) / 60000
        const isUrgent = minutesUntil > 0 && minutesUntil < 60
        const statusInfo = STATUS_LABELS[apt.status] ?? { label: apt.status, color: 'bg-gray-100 text-gray-600' }

        return (
          <motion.div
            key={apt.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="relative pl-8"
          >
            <div className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full border-4 border-white ${isUrgent ? 'bg-red-500' : 'bg-blue-500'}`} />

            <div className="bg-gray-50 hover:bg-blue-50/40 transition-colors border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-lg font-bold text-gray-900">{formatTime(apt.scheduled_at)}</span>
                    <span className="text-sm font-medium text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                      {apt.duration_min} min
                    </span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    {apt.service_type && (
                      <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                        {apt.service_type}
                      </span>
                    )}
                  </div>

                  <Link href={`/clinical/${apt.patient_id}`} className="text-lg font-bold text-gray-900 flex items-center gap-2 hover:text-blue-600 transition-colors w-fit">
                    <User className="w-4 h-4 text-gray-400" />
                    {(apt.patients as { full_name?: string })?.full_name ?? 'Paciente'}
                  </Link>

                  {apt.patients?.phone && (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" />
                      {apt.patients.phone}
                    </p>
                  )}

                  {apt.notes && (
                    <p className="text-sm text-gray-500 mt-1 italic">"{apt.notes}"</p>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap md:flex-col md:items-end">
                  <Link
                    href={`/clinical/${apt.patient_id}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white px-3 py-2 rounded-xl transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> Expediente
                  </Link>

                  {apt.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusChange(apt.id, 'confirmed')}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white px-3 py-2 rounded-xl transition-colors"
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Confirmar
                    </button>
                  )}

                  {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                    <>
                      <button
                        onClick={() => handleStatusChange(apt.id, 'completed')}
                        className="flex items-center gap-1.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-600 hover:text-white px-3 py-2 rounded-xl transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Completar
                      </button>
                      <button
                        onClick={() => handleStatusChange(apt.id, 'no_show')}
                        className="flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white px-3 py-2 rounded-xl transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" /> No asistió
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
