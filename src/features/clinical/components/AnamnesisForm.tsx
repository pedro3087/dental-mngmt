'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Stethoscope, CheckCircle2, AlertCircle, FileText } from 'lucide-react'

export function AnamnesisForm() {
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
          <Stethoscope className="w-6 h-6 text-blue-500" />
          Anamnesis (NOM-013)
        </h3>
        {saved && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full flex items-center gap-1"
          >
            <CheckCircle2 className="w-4 h-4" /> Guardado
          </motion.span>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
        <AlertCircle className="w-4 h-4 text-orange-400" />
        Obligatorio por normativa oficial mexicana.
      </p>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Alergias Conocidas</label>
          <input 
            type="text" 
            placeholder="Ej. Penicilina, Látex..." 
            className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 border"
            defaultValue="Ninguna"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-semibold text-gray-700">Enfermedades Crónicas</label>
          <input 
            type="text" 
            placeholder="Ej. Diabetes, Hipertensión..." 
            className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 border border-red-200 bg-red-50/30"
            defaultValue="Hipertensión Controlada"
          />
        </div>

        <div className="space-y-1 flex-1">
          <label className="text-sm font-semibold text-gray-700">Medicamentos Actuales</label>
          <textarea 
            placeholder="Medicamentos, dosis y frecuencia..." 
            rows={3}
            className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 border resize-none"
            defaultValue="Losartán 50mg diario"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-gray-700">Tipo de Sangre</label>
            <select className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm px-4 py-2.5 border">
              <option value="O+">O Positivo (+)</option>
              <option value="A+">A Positivo (+)</option>
              <option value="B+">B Positivo (+)</option>
              <option value="AB+">AB Positivo (+)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
              <FileText className="w-4 h-4" />
              Guardar Historial
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
