'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Stethoscope, CheckCircle2, AlertCircle, Save } from 'lucide-react'
import { saveAnamnesis } from '@/actions/clinical'

interface AnamnesisData {
  allergies: string
  chronic_diseases: string
  medications: string
  blood_type: string
  previous_surgeries: string
  family_history: string
}

interface AnamnesisFormProps {
  patientId: string
  initialData?: Record<string, unknown>
}

export function AnamnesisForm({ patientId, initialData }: AnamnesisFormProps) {
  const anamnesis = initialData as Partial<AnamnesisData> | undefined

  const [form, setForm] = useState<AnamnesisData>({
    allergies: anamnesis?.allergies ?? '',
    chronic_diseases: anamnesis?.chronic_diseases ?? '',
    medications: anamnesis?.medications ?? '',
    blood_type: anamnesis?.blood_type ?? '',
    previous_surgeries: anamnesis?.previous_surgeries ?? '',
    family_history: anamnesis?.family_history ?? '',
  })

  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleChange(field: keyof AnamnesisData, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    await saveAnamnesis(patientId, form as unknown as Record<string, unknown>)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
          <Stethoscope className="w-5 h-5 text-blue-500" />
          Anamnesis (NOM-013)
        </h3>
        {saved && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Guardado
          </motion.span>
        )}
      </div>

      <p className="text-xs text-orange-500 mb-5 flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5" />
        Obligatorio por normativa oficial mexicana
      </p>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Alergias conocidas</label>
          <input
            type="text"
            value={form.allergies}
            onChange={e => handleChange('allergies', e.target.value)}
            placeholder="Ej. Penicilina, Látex, Ninguna"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Enfermedades crónicas</label>
          <input
            type="text"
            value={form.chronic_diseases}
            onChange={e => handleChange('chronic_diseases', e.target.value)}
            placeholder="Ej. Diabetes, Hipertensión, Ninguna"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Medicamentos actuales</label>
          <textarea
            value={form.medications}
            onChange={e => handleChange('medications', e.target.value)}
            placeholder="Medicamentos, dosis y frecuencia..."
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Cirugías previas</label>
          <input
            type="text"
            value={form.previous_surgeries}
            onChange={e => handleChange('previous_surgeries', e.target.value)}
            placeholder="Ej. Apendicectomía 2018, Ninguna"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Antecedentes familiares</label>
          <input
            type="text"
            value={form.family_history}
            onChange={e => handleChange('family_history', e.target.value)}
            placeholder="Ej. Diabetes paterna, Hipertensión"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-2 gap-4 items-end mt-auto pt-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipo de sangre</label>
            <select
              value={form.blood_type}
              onChange={e => handleChange('blood_type', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Desconocido</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50 text-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
