'use client'

import { useState } from 'react'
import { AgendaTimeline } from './AgendaTimeline'
import { NewAppointmentModal } from './NewAppointmentModal'

export function AgendaClientView({ initialAppointments }: { initialAppointments: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda Clínica</h2>
          <p className="text-sm text-gray-500 mt-1">Gestiona tus citas de hoy y próximos días.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          + Nueva Cita
        </button>
      </div>

      <div className="bg-white border text-gray-900 border-gray-100 rounded-3xl p-6 shadow-sm">
        <AgendaTimeline initialAppointments={initialAppointments} />
      </div>

      <NewAppointmentModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}
