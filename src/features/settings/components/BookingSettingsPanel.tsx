'use client'

import { useState, useTransition } from 'react'
import { Plus, Trash2, Edit3, Check, X, GripVertical, ExternalLink, Globe, GlobeLock } from 'lucide-react'
import {
  updateBookingSchedule, upsertBookingService,
  toggleBookingService, deleteBookingService,
} from '@/actions/settings'
import type { BookingService, BookingSettings } from '@/actions/settings'

// ─── Constants ────────────────────────────────────────────────────────────────

const EMOJIS = ['🦷','✨','⚡','🔧','💊','🏆','💉','🩻','🩺','🔬','💡','❤️','🧊','🌟','💎','🪥','🩹','😁','🫀','🧬']

const ACCENTS = [
  { id: 'blue',    label: 'Azul',       dot: 'bg-blue-500' },
  { id: 'cyan',    label: 'Cian',       dot: 'bg-cyan-500' },
  { id: 'amber',   label: 'Ámbar',      dot: 'bg-amber-500' },
  { id: 'violet',  label: 'Violeta',    dot: 'bg-violet-500' },
  { id: 'rose',    label: 'Rosa',       dot: 'bg-rose-500' },
  { id: 'emerald', label: 'Esmeralda',  dot: 'bg-emerald-500' },
  { id: 'orange',  label: 'Naranja',    dot: 'bg-orange-500' },
  { id: 'pink',    label: 'Rosa fuerte',dot: 'bg-pink-500' },
]

const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
const HOURS     = Array.from({ length: 15 }, (_, i) => i + 7) // 7–21
const INTERVALS = [15, 30, 45, 60]

function fmtHour(h: number) {
  const ampm = h >= 12 ? 'PM' : 'AM'
  const display = h > 12 ? h - 12 : h
  return `${display}:00 ${ampm}`
}

// ─── Service form (shared for add + edit) ─────────────────────────────────────

interface ServiceFormState {
  label: string; emoji: string; durationMin: number
  description: string; tag: string; accent: string
}

const EMPTY_FORM: ServiceFormState = {
  label: '', emoji: '🦷', durationMin: 60,
  description: '', tag: '', accent: 'blue',
}

function ServiceForm({
  initial, onSave, onCancel, saving,
}: {
  initial: ServiceFormState
  onSave: (data: ServiceFormState) => void
  onCancel: () => void
  saving: boolean
}) {
  const [form, setForm] = useState<ServiceFormState>(initial)
  const set = (k: keyof ServiceFormState, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Emoji */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Emoji</label>
          <select
            value={form.emoji}
            onChange={e => set('emoji', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
          </select>
        </div>

        {/* Duration */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Duración (min)</label>
          <input
            type="number" min={15} step={15}
            value={form.durationMin}
            onChange={e => set('durationMin', parseInt(e.target.value) || 30)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Tag */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Badge (opcional)</label>
          <input
            value={form.tag}
            onChange={e => set('tag', e.target.value)}
            placeholder="Popular, Nuevo…"
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>

        {/* Accent */}
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-600">Color</label>
          <select
            value={form.accent}
            onChange={e => set('accent', e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {ACCENTS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
          </select>
        </div>
      </div>

      {/* Name */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Nombre del servicio *</label>
        <input
          required value={form.label}
          onChange={e => set('label', e.target.value)}
          placeholder="Ej: Limpieza Dental"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-600">Descripción</label>
        <input
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Breve descripción para el paciente"
          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={() => { if (form.label.trim()) onSave(form) }}
          disabled={saving || !form.label.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          <Check className="w-4 h-4" />
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
        <button
          onClick={onCancel}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <X className="w-4 h-4" /> Cancelar
        </button>
      </div>
    </div>
  )
}

// ─── Service row ──────────────────────────────────────────────────────────────

function ServiceRow({
  service, index, total, onToggle, onEdit, onDelete,
}: {
  service: BookingService; index: number; total: number
  onToggle: (id: string, active: boolean) => void
  onEdit: (s: BookingService) => void
  onDelete: (id: string) => void
}) {
  const accent = ACCENTS.find(a => a.id === service.accent)

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border-2 transition-all ${
      service.active ? 'border-gray-100 bg-white' : 'border-dashed border-gray-200 bg-gray-50 opacity-60'
    }`}>
      <GripVertical className="w-4 h-4 text-gray-300 flex-shrink-0 cursor-grab" />

      <div className="text-2xl">{service.emoji}</div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-semibold ${service.active ? 'text-gray-900' : 'text-gray-400'}`}>
            {service.label}
          </span>
          {service.tag && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{service.tag}</span>
          )}
          {accent && (
            <span className={`w-2 h-2 rounded-full ${accent.dot}`} title={accent.label} />
          )}
        </div>
        <p className="text-xs text-gray-400 truncate">{service.duration_min} min · {service.description}</p>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Toggle */}
        <button
          onClick={() => onToggle(service.id, !service.active)}
          className={`relative inline-flex h-5 w-9 rounded-full transition-colors duration-200 ${
            service.active ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          title={service.active ? 'Desactivar' : 'Activar'}
        >
          <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
            service.active ? 'translate-x-4' : 'translate-x-0.5'
          }`} />
        </button>

        <button
          onClick={() => onEdit(service)}
          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          title="Editar"
        >
          <Edit3 className="w-4 h-4" />
        </button>

        <button
          onClick={() => onDelete(service.id)}
          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Main panel ───────────────────────────────────────────────────────────────

export function BookingSettingsPanel({
  initialServices, initialSettings, clinicId,
}: {
  initialServices: BookingService[]
  initialSettings: BookingSettings | null
  clinicId: string
}) {
  const [services,  setServices]  = useState<BookingService[]>(initialServices)
  const [settings,  setSettings]  = useState<BookingSettings>(
    initialSettings ?? {
      id: '', clinic_id: clinicId,
      open_days: [1,2,3,4,5,6], start_hour: 9, end_hour: 19,
      slot_interval: 30, booking_active: true,
    }
  )

  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [schedSaved,  setSchedSaved] = useState(false)
  const [isPending,   startTransition] = useTransition()

  // ── Service actions ──

  function handleToggle(id: string, active: boolean) {
    setServices(s => s.map(x => x.id === id ? { ...x, active } : x))
    startTransition(async () => { await toggleBookingService(id, active) })
  }

  function handleDelete(id: string) {
    if (!confirm('¿Eliminar este servicio?')) return
    setServices(s => s.filter(x => x.id !== id))
    startTransition(async () => { await deleteBookingService(id) })
  }

  function handleSaveService(form: ServiceFormState, existingId?: string) {
    startTransition(async () => {
      const res = await upsertBookingService({
        id:          existingId,
        label:       form.label,
        emoji:       form.emoji,
        durationMin: form.durationMin,
        description: form.description,
        tag:         form.tag || undefined,
        accent:      form.accent,
        active:      true,
        orderIndex:  existingId
          ? (services.find(s => s.id === existingId)?.order_index ?? 99)
          : services.length + 1,
      })
      if (!res.error) {
        // Refresh list from server (simple: reload page state)
        if (existingId) {
          setServices(s => s.map(x => x.id === existingId ? {
            ...x,
            label: form.label, emoji: form.emoji,
            duration_min: form.durationMin, description: form.description,
            tag: form.tag || null, accent: form.accent,
          } : x))
        } else {
          setServices(s => [...s, {
            id: crypto.randomUUID(), clinic_id: clinicId,
            label: form.label, emoji: form.emoji,
            duration_min: form.durationMin, description: form.description,
            tag: form.tag || null, accent: form.accent,
            active: true, order_index: s.length + 1,
            created_at: '', updated_at: '',
          }])
        }
        setEditingId(null)
        setShowAddForm(false)
      }
    })
  }

  // ── Schedule actions ──

  function toggleDay(day: number) {
    setSettings(s => ({
      ...s,
      open_days: s.open_days.includes(day)
        ? s.open_days.filter(d => d !== day)
        : [...s.open_days, day].sort(),
    }))
  }

  async function handleSaveSchedule() {
    startTransition(async () => {
      const res = await updateBookingSchedule({
        openDays:      settings.open_days,
        startHour:     settings.start_hour,
        endHour:       settings.end_hour,
        slotInterval:  settings.slot_interval,
        bookingActive: settings.booking_active,
      })
      if (!res.error) {
        setSchedSaved(true)
        setTimeout(() => setSchedSaved(false), 2000)
      }
    })
  }

  // ── Render ──

  return (
    <div className="space-y-6">

      {/* ── Booking page toggle ── */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
          settings.booking_active ? 'bg-green-100' : 'bg-gray-100'
        }`}>
          {settings.booking_active
            ? <Globe className="w-6 h-6 text-green-600" />
            : <GlobeLock className="w-6 h-6 text-gray-400" />
          }
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">Página pública de reservas</p>
          <p className="text-sm text-gray-500">
            {settings.booking_active
              ? 'Activa — los pacientes pueden agendar en /book'
              : 'Desactivada — los pacientes no pueden agendar online'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {settings.booking_active && (
            <a
              href="/book" target="_blank" rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <ExternalLink className="w-4 h-4" /> Ver
            </a>
          )}
          <button
            onClick={() => {
              const next = { ...settings, booking_active: !settings.booking_active }
              setSettings(next)
              startTransition(async () => {
                await updateBookingSchedule({
                  openDays: next.open_days, startHour: next.start_hour,
                  endHour: next.end_hour, slotInterval: next.slot_interval,
                  bookingActive: next.booking_active,
                })
              })
            }}
            className={`relative inline-flex h-6 w-11 rounded-full transition-colors duration-200 ${
              settings.booking_active ? 'bg-blue-600' : 'bg-gray-300'
            }`}
          >
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 mt-0.5 ${
              settings.booking_active ? 'translate-x-5' : 'translate-x-0.5'
            }`} />
          </button>
        </div>
      </div>

      {/* ── Services ── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div>
            <h2 className="font-semibold text-gray-900">Servicios</h2>
            <p className="text-xs text-gray-400 mt-0.5">{services.filter(s => s.active).length} de {services.length} activos</p>
          </div>
          <button
            onClick={() => { setShowAddForm(true); setEditingId(null) }}
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Agregar
          </button>
        </div>

        <div className="p-4 space-y-2">
          {services.map((svc, i) =>
            editingId === svc.id ? (
              <ServiceForm
                key={svc.id}
                initial={{ label: svc.label, emoji: svc.emoji, durationMin: svc.duration_min, description: svc.description ?? '', tag: svc.tag ?? '', accent: svc.accent }}
                onSave={form => handleSaveService(form, svc.id)}
                onCancel={() => setEditingId(null)}
                saving={isPending}
              />
            ) : (
              <ServiceRow
                key={svc.id}
                service={svc}
                index={i}
                total={services.length}
                onToggle={handleToggle}
                onEdit={s => { setEditingId(s.id); setShowAddForm(false) }}
                onDelete={handleDelete}
              />
            )
          )}

          {showAddForm && (
            <ServiceForm
              initial={EMPTY_FORM}
              onSave={form => handleSaveService(form)}
              onCancel={() => setShowAddForm(false)}
              saving={isPending}
            />
          )}

          {services.length === 0 && !showAddForm && (
            <div className="text-center py-8 text-gray-400 text-sm">
              No hay servicios. Agrega el primero.
            </div>
          )}
        </div>
      </div>

      {/* ── Schedule ── */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-900">Horario de atención</h2>
          <p className="text-xs text-gray-400 mt-0.5">Define cuándo los pacientes pueden agendar citas</p>
        </div>

        <div className="p-5 space-y-6">
          {/* Days */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Días disponibles</label>
            <div className="flex gap-2 flex-wrap">
              {DAYS_ES.map((day, i) => {
                const active = settings.open_days.includes(i)
                return (
                  <button
                    key={i}
                    onClick={() => toggleDay(i)}
                    className={`px-3 py-1.5 rounded-xl text-sm font-medium border-2 transition-all ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Hours + interval */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Hora de apertura</label>
              <select
                value={settings.start_hour}
                onChange={e => setSettings(s => ({ ...s, start_hour: parseInt(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {HOURS.map(h => (
                  <option key={h} value={h}>{fmtHour(h)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Hora de cierre</label>
              <select
                value={settings.end_hour}
                onChange={e => setSettings(s => ({ ...s, end_hour: parseInt(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {HOURS.filter(h => h > settings.start_hour).map(h => (
                  <option key={h} value={h}>{fmtHour(h)}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Intervalo de slots</label>
              <select
                value={settings.slot_interval}
                onChange={e => setSettings(s => ({ ...s, slot_interval: parseInt(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
              >
                {INTERVALS.map(i => (
                  <option key={i} value={i}>Cada {i} minutos</option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveSchedule}
            disabled={isPending}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              schedSaved
                ? 'bg-green-100 text-green-700 border-2 border-green-200'
                : 'bg-gray-900 hover:bg-gray-800 text-white'
            } disabled:opacity-50`}
          >
            {schedSaved ? <><Check className="w-4 h-4" /> Guardado</> : 'Guardar horario'}
          </button>
        </div>
      </div>
    </div>
  )
}
