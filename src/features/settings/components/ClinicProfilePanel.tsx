'use client'

import { useState, useTransition } from 'react'
import { Building2, Check, Palette } from 'lucide-react'
import { updateClinicProfile } from '@/actions/settings'
import type { ClinicProfile } from '@/actions/settings'

const PRESET_COLORS = [
  '#3B82F6', '#06B6D4', '#8B5CF6', '#10B981',
  '#F59E0B', '#EF4444', '#EC4899', '#6366F1',
]

export function ClinicProfilePanel({ initial }: { initial: ClinicProfile | null }) {
  const [form, setForm] = useState({
    name:          initial?.name          ?? '',
    phone:         initial?.phone         ?? '',
    address:       initial?.address       ?? '',
    rfc:           initial?.rfc           ?? '',
    logo_url:      initial?.logo_url      ?? '',
    primary_color: initial?.primary_color ?? '#3B82F6',
  })
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState<string | null>(null)
  const [isPending, start]  = useTransition()

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const result = await updateClinicProfile(form)
      if (result.error) { setError(result.error); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-3 p-5 border-b border-gray-100">
        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
          <Building2 className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Perfil de la Clínica</h2>
          <p className="text-xs text-gray-500">Datos que aparecen en facturas y página pública</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Nombre */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">Nombre de la Clínica *</label>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            required
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="VitalDent"
          />
        </div>

        {/* Teléfono + RFC */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Teléfono</label>
            <input
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              type="tel"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+52 55 1234 5678"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">RFC (emisor CFDI)</label>
            <input
              value={form.rfc}
              onChange={e => set('rfc', e.target.value.toUpperCase())}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="VIT900101AA1"
              maxLength={13}
            />
          </div>
        </div>

        {/* Dirección */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">Dirección</label>
          <textarea
            value={form.address}
            onChange={e => set('address', e.target.value)}
            rows={2}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Av. Insurgentes Sur 1234, Col. Narvarte, CDMX"
          />
        </div>

        {/* Logo URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-gray-700">URL del Logo</label>
          <input
            value={form.logo_url}
            onChange={e => set('logo_url', e.target.value)}
            type="url"
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://..."
          />
        </div>

        {/* Color primario */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
            <Palette className="w-3.5 h-3.5" />
            Color Primario
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {PRESET_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => set('primary_color', color)}
                className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: color,
                  borderColor: form.primary_color === color ? '#1F2937' : 'transparent',
                }}
              />
            ))}
            <input
              type="color"
              value={form.primary_color}
              onChange={e => set('primary_color', e.target.value)}
              className="w-7 h-7 rounded-full border border-gray-200 cursor-pointer"
              title="Color personalizado"
            />
            <span className="text-xs text-gray-400 font-mono ml-1">{form.primary_color}</span>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
        )}

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            {saved ? (
              <><Check className="w-4 h-4" /> Guardado</>
            ) : isPending ? (
              <span className="animate-pulse">Guardando...</span>
            ) : (
              'Guardar cambios'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
