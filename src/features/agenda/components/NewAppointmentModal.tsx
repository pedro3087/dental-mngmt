'use client'

import { useState } from 'react'
import { createAppointment } from '@/actions/agenda'
import { X, Calendar as CalendarIcon, Clock, User, Phone, Edit3 } from 'lucide-react'

export function NewAppointmentModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    
    // Convertir fecha local y hora local a Date ISO
    const dateInput = formData.get('date_only') as string
    const timeInput = formData.get('time_only') as string
    
    if (dateInput && timeInput) {
      const combinedDate = new Date(`${dateInput}T${timeInput}`)
      formData.append('appointment_date', combinedDate.toISOString())
    }

    const { success, error: serverError } = await createAppointment(formData)

    if (!success) {
      setError(serverError || 'Error al guardar la cita.')
    } else {
      onClose()
      // Se puede mostrar un toast de éxito aquí
    }
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Nueva Cita</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          {/* Información del Paciente */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> Datos del Paciente
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Nombre</label>
                <input 
                  type="text" 
                  name="first_name" 
                  required 
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border" 
                  placeholder="Juan"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Apellidos</label>
                <input 
                  type="text" 
                  name="last_name" 
                  required 
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border" 
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Teléfono (WhatsApp)</label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-4 top-3 text-gray-400" />
                <input 
                  type="tel" 
                  name="phone" 
                  required 
                  className="w-full pl-10 border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border" 
                  placeholder="+52 55 1234 5678"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          {/* Información de la Cita */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Detalles de Cita
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Fecha</label>
                <input 
                  type="date" 
                  name="date_only" 
                  required 
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Hora</label>
                <input 
                  type="time" 
                  name="time_only" 
                  required 
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border" 
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Duración Aprox.</label>
                <select 
                  name="duration_minutes"
                  className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border"
                >
                  <option value="30">30 minutos</option>
                  <option value="60" selected>60 minutos</option>
                  <option value="90">90 minutos</option>
                  <option value="120">2 horas</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Motivo de consulta / Notas</label>
              <div className="relative">
                <Edit3 className="w-4 h-4 absolute left-4 top-3 text-gray-400" />
                <textarea 
                  name="notes" 
                  rows={2}
                  className="w-full pl-10 border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2 border resize-none" 
                  placeholder="P. ej. Limpieza general, bracket suelto, extracción..."
                ></textarea>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {loading ? 'Guardando...' : 'Agendar y Notificar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
