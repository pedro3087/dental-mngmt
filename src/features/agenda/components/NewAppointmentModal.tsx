'use client'

import { useState, useEffect, useRef } from 'react'
import { createAppointment } from '@/actions/agenda'
import { getPatients } from '@/actions/patients'
import { X, Calendar as CalendarIcon, Clock, User, Phone, Edit3, Stethoscope, Search, Check } from 'lucide-react'

interface Patient {
  id: string
  full_name: string
  phone: string | null
  email: string | null
}

interface NewAppointmentModalProps {
  isOpen: boolean
  onClose: () => void
  defaultDate?: string
  onCreated?: () => void
}

export function NewAppointmentModal({ isOpen, onClose, defaultDate, onCreated }: NewAppointmentModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Patient search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searching, setSearching] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced patient search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      const result = await getPatients(searchQuery)
      setSearchResults(result.data?.slice(0, 6) ?? [])
      setShowDropdown(true)
      setSearching(false)
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [searchQuery])

  // Reset when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setSearchResults([])
      setSelectedPatient(null)
      setShowDropdown(false)
      setError(null)
    }
  }, [isOpen])

  function selectPatient(patient: Patient) {
    setSelectedPatient(patient)
    setSearchQuery(patient.full_name)
    setShowDropdown(false)
  }

  function clearPatient() {
    setSelectedPatient(null)
    setSearchQuery('')
    setSearchResults([])
  }

  if (!isOpen) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const dateInput = formData.get('date_only') as string
    const timeInput = formData.get('time_only') as string

    if (dateInput && timeInput) {
      formData.set('scheduled_at', new Date(`${dateInput}T${timeInput}`).toISOString())
    }

    // If a patient was selected from search, pass their id
    if (selectedPatient) {
      formData.set('patient_id', selectedPatient.id)
      formData.set('full_name', selectedPatient.full_name)
      if (selectedPatient.phone) formData.set('phone', selectedPatient.phone)
    }

    const { success, error: serverError } = await createAppointment(formData)

    if (!success) {
      setError(serverError || 'Error al guardar la cita.')
    } else {
      onCreated ? onCreated() : onClose()
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-900">Nueva Cita</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">{error}</div>
          )}

          {/* Paciente */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4" /> Datos del Paciente
            </h3>

            {/* Patient search */}
            <div className="space-y-1" ref={searchRef}>
              <label className="text-xs font-medium text-gray-700">Buscar paciente existente</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    if (selectedPatient) setSelectedPatient(null)
                  }}
                  placeholder="Nombre, teléfono o email..."
                  className="w-full pl-10 pr-10 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {selectedPatient && (
                  <button type="button" onClick={clearPatient} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                )}
                {searching && (
                  <div className="absolute right-3 top-3 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                )}

                {/* Dropdown results */}
                {showDropdown && searchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {searchResults.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => selectPatient(patient)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-left transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {patient.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{patient.full_name}</p>
                          {patient.phone && <p className="text-xs text-gray-500">{patient.phone}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {showDropdown && searchResults.length === 0 && searchQuery.trim() && !searching && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 text-sm text-gray-500">
                    No encontrado — completa los campos manualmente
                  </div>
                )}
              </div>

              {/* Selected patient badge */}
              {selectedPatient && (
                <div className="flex items-center gap-2 px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span className="font-medium">{selectedPatient.full_name}</span>
                  {selectedPatient.phone && <span className="text-green-600">· {selectedPatient.phone}</span>}
                </div>
              )}
            </div>

            {/* Manual fields (shown when no patient selected) */}
            {!selectedPatient && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Nombre completo *</label>
                  <input type="text" name="full_name" required placeholder="María García López"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-700">Teléfono (WhatsApp)</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                    <input type="tel" name="phone" placeholder="+52 55 1234 5678"
                      className="w-full pl-10 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="border-t border-gray-100" />

          {/* Cita */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" /> Detalles de la Cita
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Fecha *</label>
                <input type="date" name="date_only" required defaultValue={defaultDate}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Hora *</label>
                <input type="time" name="time_only" required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Duración</label>
                <div className="relative">
                  <Clock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <select name="duration_min" defaultValue="60"
                    className="w-full pl-10 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="30">30 min</option>
                    <option value="60">60 min</option>
                    <option value="90">90 min</option>
                    <option value="120">2 horas</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-700">Servicio</label>
                <div className="relative">
                  <Stethoscope className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                  <input type="text" name="service_type" placeholder="Ej. Limpieza, Brackets..."
                    className="w-full pl-10 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-700">Notas</label>
              <div className="relative">
                <Edit3 className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <textarea name="notes" rows={2} placeholder="Motivo de consulta, observaciones..."
                  className="w-full pl-10 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Guardando...' : 'Agendar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
