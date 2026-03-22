'use client'

import { useState, useTransition } from 'react'
import { Bot, Zap, Brain, MessageSquare, Stethoscope, Check, Sparkles } from 'lucide-react'
import { updateAiSettings } from '@/actions/settings'
import type { AiSettings } from '@/actions/settings'

const MODELS = [
  {
    value: 'google/gemini-flash-1.5',
    label: 'Gemini Flash 1.5',
    description: 'Rápido y eficiente — ideal para uso diario',
    icon: Zap,
    color: 'text-amber-500',
  },
  {
    value: 'google/gemini-pro-1.5',
    label: 'Gemini Pro 1.5',
    description: 'Más preciso — mejor para análisis clínicos complejos',
    icon: Brain,
    color: 'text-violet-500',
  },
]

const DEFAULT_PROMPTS = [
  'Dame un resumen del último expediente revisado',
  'Estadísticas de ausentismo del mes',
  '¿Cuántas facturas están pendientes de cobro?',
]

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

export function AiSettingsPanel({ initial }: { initial: AiSettings | null }) {
  const [form, setForm] = useState({
    copilotEnabled:    initial?.copilot_enabled     ?? true,
    patientBotEnabled: initial?.patient_bot_enabled ?? true,
    aiModel:           initial?.ai_model            ?? 'google/gemini-flash-1.5',
    clinicDisplayName: initial?.clinic_display_name ?? '',
    quickPrompts:      initial?.quick_prompts?.length
      ? [...initial.quick_prompts, ...DEFAULT_PROMPTS].slice(0, 3)
      : [...DEFAULT_PROMPTS],
  })
  const [saved, setSaved]  = useState(false)
  const [error, setError]  = useState<string | null>(null)
  const [isPending, start] = useTransition()

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  function setPrompt(i: number, v: string) {
    const prompts = [...form.quickPrompts]
    prompts[i] = v
    set('quickPrompts', prompts)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    start(async () => {
      const result = await updateAiSettings({
        ...form,
        quickPrompts: form.quickPrompts.filter(p => p.trim()),
      })
      if (result.error) { setError(result.error); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Activar / desactivar módulos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Bot className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Módulos de IA</h2>
            <p className="text-xs text-gray-500">Activa o desactiva cada módulo independientemente</p>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-violet-50 rounded-xl flex items-center justify-center">
                <Stethoscope className="w-4 h-4 text-violet-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Copiloto Clínico</p>
                <p className="text-xs text-gray-500">Asistente para el dentista en el panel de AI Copilot</p>
              </div>
            </div>
            <Toggle enabled={form.copilotEnabled} onChange={v => set('copilotEnabled', v)} />
          </div>
          <div className="border-t border-gray-50 pt-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Chatbot Paciente</p>
                <p className="text-xs text-gray-500">Widget flotante en el portal del paciente</p>
              </div>
            </div>
            <Toggle enabled={form.patientBotEnabled} onChange={v => set('patientBotEnabled', v)} />
          </div>
        </div>
      </div>

      {/* Modelo IA */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Modelo de IA</h2>
            <p className="text-xs text-gray-500">Aplica a todos los módulos de IA de la clínica</p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {MODELS.map(m => (
            <label
              key={m.value}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                form.aiModel === m.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="ai_model"
                value={m.value}
                checked={form.aiModel === m.value}
                onChange={() => set('aiModel', m.value)}
                className="sr-only"
              />
              <m.icon className={`w-5 h-5 flex-shrink-0 ${m.color}`} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">{m.label}</p>
                <p className="text-xs text-gray-500">{m.description}</p>
              </div>
              {form.aiModel === m.value && (
                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Nombre de la clínica en el copiloto */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
            <Bot className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Nombre en el Copiloto</h2>
            <p className="text-xs text-gray-500">Cómo se presenta el asistente de IA a tus pacientes y equipo</p>
          </div>
        </div>
        <div className="p-5">
          <input
            value={form.clinicDisplayName}
            onChange={e => set('clinicDisplayName', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="VitalDent"
          />
          <p className="mt-1.5 text-xs text-gray-400">
            El copiloto dirá: "Soy el asistente de <strong>{form.clinicDisplayName || 'tu clínica'}</strong>"
          </p>
        </div>
      </div>

      {/* Prompts rápidos */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Prompts Rápidos del Dentista</h2>
            <p className="text-xs text-gray-500">Accesos directos que aparecen en el Copiloto Clínico</p>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
              <input
                value={form.quickPrompts[i] ?? ''}
                onChange={e => setPrompt(i, e.target.value)}
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                placeholder={DEFAULT_PROMPTS[i]}
              />
            </div>
          ))}
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
