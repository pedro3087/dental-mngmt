'use client'

import { useState, useTransition, useRef, KeyboardEvent } from 'react'
import { Package, Bell, Tag, Ruler, Mail, Check, X, Plus } from 'lucide-react'
import { updateInventorySettings } from '@/actions/settings'
import type { InventorySettings } from '@/actions/settings'

function TagInput({
  label, tags, onChange, placeholder, accentClass,
}: {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string
  accentClass: string
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  function addTag(raw: string) {
    const val = raw.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput('')
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <div
        className="min-h-[44px] flex flex-wrap gap-1.5 border border-gray-200 rounded-xl px-3 py-2 cursor-text focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => (
          <span
            key={tag}
            className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${accentClass}`}
          >
            {tag}
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onChange(tags.filter(t => t !== tag)) }}
              className="opacity-60 hover:opacity-100"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => { if (input.trim()) addTag(input) }}
          placeholder={tags.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] text-sm outline-none bg-transparent placeholder-gray-400"
        />
      </div>
      <p className="text-xs text-gray-400">Presiona Enter o coma para agregar</p>
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-600' : 'bg-gray-200'
      }`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
        enabled ? 'translate-x-6' : 'translate-x-1'
      }`} />
    </button>
  )
}

export function InventorySettingsPanel({ initial }: { initial: InventorySettings | null }) {
  const [form, setForm] = useState({
    defaultMinQuantity: initial?.default_min_quantity ?? 5,
    alertsEnabled:      initial?.alerts_enabled      ?? true,
    categories:         initial?.categories          ?? [],
    units:              initial?.units               ?? [],
    alertEmail:         initial?.alert_email         ?? '',
  })
  const [saved, setSaved]  = useState(false)
  const [error, setError]  = useState<string | null>(null)
  const [isPending, start] = useTransition()

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const result = await updateInventorySettings(form)
      if (result.error) { setError(result.error); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Alerts toggle + threshold */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <Bell className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900">Alertas de Stock Bajo</h2>
            <p className="text-xs text-gray-500">Notificar cuando un ítem baje del umbral mínimo</p>
          </div>
          <Toggle enabled={form.alertsEnabled} onChange={v => set('alertsEnabled', v)} />
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5" />
                Umbral mínimo global
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={999}
                  value={form.defaultMinQuantity}
                  onChange={e => set('defaultMinQuantity', Number(e.target.value))}
                  className="w-24 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <span className="text-xs text-gray-400">unidades por defecto en nuevos ítems</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Email para alertas
              </label>
              <input
                type="email"
                value={form.alertEmail}
                onChange={e => set('alertEmail', e.target.value)}
                placeholder="admin@clinica.com"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Tag className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Categorías Predefinidas</h2>
            <p className="text-xs text-gray-500">Opciones al crear nuevos ítems de inventario</p>
          </div>
        </div>
        <div className="p-5">
          <TagInput
            label="Categorías"
            tags={form.categories}
            onChange={v => set('categories', v)}
            placeholder="Ej: Resinas, Anestesia, Guantes..."
            accentClass="bg-blue-100 text-blue-700"
          />
        </div>
      </div>

      {/* Units */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Ruler className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Unidades de Medida</h2>
            <p className="text-xs text-gray-500">Opciones al crear nuevos ítems de inventario</p>
          </div>
        </div>
        <div className="p-5">
          <TagInput
            label="Unidades"
            tags={form.units}
            onChange={v => set('units', v)}
            placeholder="Ej: pieza, caja, frasco, cartucho..."
            accentClass="bg-emerald-100 text-emerald-700"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>
      )}

      <div className="flex justify-end">
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
            'Guardar configuración'
          )}
        </button>
      </div>
    </form>
  )
}
