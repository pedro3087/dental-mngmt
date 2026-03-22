'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { FileDown, Receipt, ShieldCheck } from 'lucide-react'
import { createInvoice } from '@/actions/billing'
import type { Patient } from '@/types/database'

interface FastInvoiceWidgetProps {
  patients: Pick<Patient, 'id' | 'full_name' | 'rfc'>[]
}

export function FastInvoiceWidget({ patients }: FastInvoiceWidgetProps) {
  const [isPending, startTransition] = useTransition()
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await createInvoice(formData)
      if (result.success) {
        setSuccess(result.folio ?? 'Emitida')
        ;(e.target as HTMLFormElement).reset()
        setTimeout(() => setSuccess(null), 4000)
      } else {
        setError(result.error ?? 'Error desconocido')
      }
    })
  }

  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 border border-blue-700/50 rounded-3xl p-6 shadow-xl text-white relative overflow-hidden">
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
            <p className="text-blue-200 text-xs mt-0.5">Factura Rápida</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-blue-100">Paciente (Receptor)</label>
            <select
              name="patient_id"
              required
              className="w-full bg-white/10 border border-white/20 text-white rounded-xl shadow-inner focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm px-4 py-3 appearance-none"
            >
              <option value="" className="text-gray-900">Seleccionar paciente...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id} className="text-gray-900">
                  {p.full_name}{p.rfc ? ` (RFC: ${p.rfc})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-blue-100">Concepto</label>
            <input
              name="concept"
              type="text"
              placeholder="Ej. Tratamiento Ortodoncia Mensualidad 1"
              required
              className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl shadow-inner focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm px-4 py-3"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-blue-100">Subtotal (MXN)</label>
              <input
                name="amount_subtotal"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                required
                className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 rounded-xl shadow-inner focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm px-4 py-3"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-blue-100">IVA %</label>
              <select
                name="tax_rate"
                defaultValue="16"
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl shadow-inner focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm px-4 py-3 appearance-none"
              >
                <option value="0" className="text-gray-900">0% (Exento)</option>
                <option value="16" className="text-gray-900">16%</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-blue-100">Uso CFDI</label>
              <select
                name="cfdi_use"
                defaultValue="D01"
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl shadow-inner focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm px-4 py-3 appearance-none"
              >
                <option value="G03" className="text-gray-900">G03 - Gastos Generales</option>
                <option value="D01" className="text-gray-900">D01 - Honorarios Médicos</option>
                <option value="P01" className="text-gray-900">P01 - Por Definir</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-blue-100">Forma de Pago</label>
              <select
                name="payment_form"
                defaultValue="04"
                className="w-full bg-white/10 border border-white/20 text-white rounded-xl shadow-inner focus:ring-emerald-400 focus:border-emerald-400 sm:text-sm px-4 py-3 appearance-none"
              >
                <option value="01" className="text-gray-900">01 - Efectivo</option>
                <option value="04" className="text-gray-900">04 - Tarjeta</option>
                <option value="28" className="text-gray-900">28 - Transferencia</option>
              </select>
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-300 bg-red-900/30 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="pt-2">
            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex items-center justify-center gap-2 bg-white/20 text-white px-4 py-3.5 rounded-xl font-bold border border-emerald-400/50"
              >
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Timbrado: {success}
              </motion.div>
            ) : (
              <button
                type="submit"
                disabled={isPending}
                className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-emerald-500/25 disabled:opacity-70"
              >
                {isPending ? (
                  <span className="animate-pulse">Conectando al PAC...</span>
                ) : (
                  <>
                    <FileDown className="w-5 h-5" />
                    Generar y Timbrar Factura
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
