'use client'

import { useState, useTransition } from 'react'
import { Bell, MessageCircle, Mail, Bot, Check } from 'lucide-react'
import { updateNotificationSettings } from '@/actions/settings'
import type { NotificationSettings } from '@/actions/settings'

const HOURS_OPTIONS = [
  { value: 2,  label: '2 horas antes' },
  { value: 4,  label: '4 horas antes' },
  { value: 24, label: '24 horas antes' },
  { value: 48, label: '48 horas antes' },
  { value: 72, label: '72 horas antes' },
]

const DEFAULT_TEMPLATE = 'Hola {nombre}, te recordamos tu cita en nuestra clínica el {fecha} a las {hora}. ¡Te esperamos! 😊'
const DEFAULT_GREETING = '¡Hola! Soy tu asistente dental 😊 ¿En qué te puedo ayudar hoy?'

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

export function NotificationsPanel({ initial }: { initial: NotificationSettings | null }) {
  const [form, setForm] = useState({
    waEnabled:        initial?.wa_enabled        ?? false,
    emailEnabled:     initial?.email_enabled     ?? false,
    reminderHours1:   initial?.reminder_hours_1  ?? 48,
    reminderHours2:   initial?.reminder_hours_2  ?? 2,
    reminderTemplate: initial?.reminder_template ?? DEFAULT_TEMPLATE,
    chatbotGreeting:  initial?.chatbot_greeting  ?? DEFAULT_GREETING,
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
      const result = await updateNotificationSettings(form)
      if (result.error) { setError(result.error); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* WhatsApp */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-green-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900">Recordatorio por WhatsApp</h2>
            <p className="text-xs text-gray-500">Mensaje automático antes de la cita</p>
          </div>
          <Toggle enabled={form.waEnabled} onChange={v => set('waEnabled', v)} />
        </div>

        {form.waEnabled && (
          <div className="p-5">
            <label className="text-xs font-medium text-gray-700">Horas de anticipación</label>
            <select
              value={form.reminderHours1}
              onChange={e => set('reminderHours1', Number(e.target.value))}
              className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
            >
              {HOURS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Mail className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-semibold text-gray-900">Recordatorio por Email</h2>
            <p className="text-xs text-gray-500">Correo automático antes de la cita</p>
          </div>
          <Toggle enabled={form.emailEnabled} onChange={v => set('emailEnabled', v)} />
        </div>

        {form.emailEnabled && (
          <div className="p-5">
            <label className="text-xs font-medium text-gray-700">Horas de anticipación</label>
            <select
              value={form.reminderHours2}
              onChange={e => set('reminderHours2', Number(e.target.value))}
              className="mt-1.5 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {HOURS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Plantilla de mensaje */}
      {(form.waEnabled || form.emailEnabled) && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 p-5 border-b border-gray-100">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
              <Bell className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-gray-900">Plantilla del Mensaje</h2>
              <p className="text-xs text-gray-500">
                Variables disponibles: <code className="bg-gray-100 px-1 rounded">{'{nombre}'}</code>{' '}
                <code className="bg-gray-100 px-1 rounded">{'{fecha}'}</code>{' '}
                <code className="bg-gray-100 px-1 rounded">{'{hora}'}</code>
              </p>
            </div>
          </div>
          <div className="p-5">
            <textarea
              value={form.reminderTemplate}
              onChange={e => set('reminderTemplate', e.target.value)}
              rows={3}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              placeholder={DEFAULT_TEMPLATE}
            />
          </div>
        </div>
      )}

      {/* Chatbot greeting */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-violet-50 rounded-xl flex items-center justify-center">
            <Bot className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Mensaje de Bienvenida del Chatbot</h2>
            <p className="text-xs text-gray-500">Primer mensaje que ve el paciente en el portal</p>
          </div>
        </div>
        <div className="p-5">
          <textarea
            value={form.chatbotGreeting}
            onChange={e => set('chatbotGreeting', e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder={DEFAULT_GREETING}
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
