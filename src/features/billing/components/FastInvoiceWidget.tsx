'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileDown, Receipt, ShieldCheck } from 'lucide-react'

export function FastInvoiceWidget() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Simulamos la llamada a un PAC del SAT
    setTimeout(() => {
      setLoading(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    }, 1500)
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 border border-blue-700/50 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
      {/* Elemento Decorativo */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Receipt className="w-32 h-32 transform rotate-12" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Timbrado CFDI 4.0</h3>
            <p className="text-blue-200 text-xs mt-0.5">Autorizado por el SAT</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-blue-100">Paciente (Receptor)</label>
            <select className="w-full bg-white/10 border border-white/20 text-white placeholder-blue-200 rounded-xl shadow-inner focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm px-4 py-3 appearance-none">
              <option value="" className="text-gray-900">Seleccionar paciente...</option>
              <option value="1" className="text-gray-900">Carlos Mendoza (RFC: MENC801021XXX)</option>
              <option value="2" className="text-gray-900">Público en General (RFC: XAXX010101000)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-blue-100">Régimen Fiscal</label>
              <select defaultValue="612" className="w-full bg-white/10 border border-white/20 text-white rounded-xl shadow-inner focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm px-4 py-3 appearance-none">
                <option value="601" className="text-gray-900">601 - General de Ley</option>
                <option value="612" className="text-gray-900">612 - Personas Físicas</option>
                <option value="616" className="text-gray-900">616 - Sin obligaciones</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-blue-100">Uso de CFDI</label>
              <select defaultValue="D01" className="w-full bg-white/10 border border-white/20 text-white rounded-xl shadow-inner focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm px-4 py-3 appearance-none">
                <option value="G03" className="text-gray-900">G03 - Gastos en general</option>
                <option value="D01" className="text-gray-900">D01 - Honorarios médicos</option>
                <option value="P01" className="text-gray-900">P01 - Por definir</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-blue-100">Concepto Especial</label>
            <input 
              type="text" 
              placeholder="Ej. Tratamiento Ortodoncia Mensualidad 1" 
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl shadow-inner focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm px-4 py-3"
            />
          </div>

          <div className="pt-2">
            {!success ? (
              <button 
                type="submit" 
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-70"
              >
                {loading ? (
                  <span className="animate-pulse">Conectando al PAC...</span>
                ) : (
                  <>
                    <FileDown className="w-5 h-5" />
                    Generar y Timbrar Factura
                  </>
                )}
              </button>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex items-center justify-center gap-2 bg-white/20 text-white px-4 py-3.5 rounded-xl font-bold border border-emerald-400/50"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Timbrado Exitoso
              </motion.div>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
