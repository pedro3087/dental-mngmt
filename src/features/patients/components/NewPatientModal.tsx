'use client'

import { useState } from 'react'
import { X, User } from 'lucide-react'
import { createPatient } from '@/actions/patients'
import type { Patient } from '@/types/database'

interface NewPatientModalProps {
  isOpen: boolean
  onClose: () => void
  onCreated: (patient: Patient) => void
}

export function NewPatientModal({ isOpen, onClose, onCreated }: NewPatientModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createPatient(formData)

    if (!result.success) {
      setError(result.error ?? 'Error al guardar')
    } else {
      // Construir objeto optimista para actualizar la tabla sin reload
      const fullName = formData.get('full_name') as string
      const optimistic: Patient = {
        id: result.patientId!,
        clinic_id: '',
        full_name: fullName,
        phone: (formData.get('phone') as string) || null,
        email: (formData.get('email') as string) || null,
        birth_date: (formData.get('birth_date') as string) || null,
        gender: (formData.get('gender') as 'M' | 'F' | 'otro' | null) || null,
        rfc: null,
        cfdi_use: 'G03',
        anamnesis: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      onCreated(optimistic)
      onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Nuevo Paciente</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Nombre completo *</label>
            <input
              type="text"
              name="full_name"
              required
              autoFocus
              placeholder="Ej. María García López"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Teléfono</label>
              <input
                type="tel"
                name="phone"
                placeholder="+52 55 1234 5678"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</label>
              <input
                type="email"
                name="email"
                placeholder="correo@ejemplo.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Fecha de nacimiento</label>
              <input
                type="date"
                name="birth_date"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Género</label>
              <select
                name="gender"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sin especificar</option>
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
                <option value="otro">Otro</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Guardando...' : 'Registrar Paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
