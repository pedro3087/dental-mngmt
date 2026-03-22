'use client'

import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Clock, MapPin, Phone, Check, Calendar, Loader2, Star } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Clinic { id: string; name: string; phone: string; address: string }

interface Service {
  id: string; label: string; emoji: string; duration: number
  desc: string; tag?: string; accent: string
}

interface BusySlot { slot_start: string; duration_min: number }

// ─── Config ───────────────────────────────────────────────────────────────────

const SERVICES: Service[] = [
  { id: 'consulta',       label: 'Consulta General',   emoji: '🦷', duration: 30,  desc: 'Primera visita, revisión y diagnóstico completo', accent: 'blue' },
  { id: 'limpieza',       label: 'Limpieza Dental',    emoji: '✨', duration: 60,  desc: 'Limpieza profunda y eliminación de sarro', tag: 'Popular', accent: 'cyan' },
  { id: 'blanqueamiento', label: 'Blanqueamiento LED', emoji: '⚡', duration: 90,  desc: 'Hasta 8 tonos más blanco en una sesión', tag: 'Nuevo', accent: 'amber' },
  { id: 'ortodoncia',     label: 'Ortodoncia',         emoji: '🔧', duration: 60,  desc: 'Brackets, alineadores transparentes y ajustes', accent: 'violet' },
  { id: 'extraccion',     label: 'Extracción',         emoji: '💊', duration: 45,  desc: 'Extracción simple o quirúrgica sin dolor', accent: 'rose' },
  { id: 'implante',       label: 'Implante Dental',    emoji: '🏆', duration: 120, desc: 'Consulta y plan personalizado de implante', accent: 'emerald' },
]

const ACCENT: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  blue:    { border: 'border-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700',    badge: 'bg-blue-100 text-blue-700' },
  cyan:    { border: 'border-cyan-500',    bg: 'bg-cyan-50',    text: 'text-cyan-700',    badge: 'bg-cyan-100 text-cyan-700' },
  amber:   { border: 'border-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700',   badge: 'bg-amber-100 text-amber-700' },
  violet:  { border: 'border-violet-500',  bg: 'bg-violet-50',  text: 'text-violet-700',  badge: 'bg-violet-100 text-violet-700' },
  rose:    { border: 'border-rose-500',    bg: 'bg-rose-50',    text: 'text-rose-700',    badge: 'bg-rose-100 text-rose-700' },
  emerald: { border: 'border-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
}

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DAYS_ES   = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toDateStr(d: Date) { return d.toISOString().split('T')[0] }

function getMonthCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const last  = new Date(year, month + 1, 0)
  const cells: (Date | null)[] = Array(first.getDay()).fill(null)
  for (let d = 1; d <= last.getDate(); d++) cells.push(new Date(year, month, d))
  return cells
}

function generateTimeSlots(startH = 9, endH = 19, step = 30) {
  const slots: string[] = []
  for (let h = startH; h < endH; h++)
    for (let m = 0; m < 60; m += step)
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  return slots
}

function isSlotBusy(slot: string, date: string, busy: BusySlot[], durationMin: number) {
  const slotMs  = new Date(`${date}T${slot}:00`).getTime()
  const slotEnd = slotMs + durationMin * 60000
  return busy.some(b => {
    const bStart = new Date(b.slot_start).getTime()
    const bEnd   = bStart + b.duration_min * 60000
    return slotMs < bEnd && slotEnd > bStart
  })
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00')
  return `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`
}

function formatTime(t: string) {
  const [h, m] = t.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  return `${h > 12 ? h - 12 : h || 12}:${String(m).padStart(2, '0')} ${ampm}`
}

// ─── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const steps = ['Servicio', 'Fecha y hora', 'Tus datos']
  return (
    <div className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const n    = i + 1
        const done = n < current
        const active = n === current
        return (
          <div key={n} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 transition-all duration-300 ${active ? 'opacity-100' : done ? 'opacity-70' : 'opacity-40'}`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                ${done ? 'bg-blue-600 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-200 text-gray-500'}`}>
                {done ? <Check className="w-4 h-4" /> : n}
              </div>
              <span className={`text-sm font-medium hidden sm:inline ${active ? 'text-gray-900' : 'text-gray-400'}`}>{label}</span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-px w-8 sm:w-12 transition-all duration-500 ${n < current ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Left panel ───────────────────────────────────────────────────────────────

function LeftPanel({ clinic }: { clinic: Clinic }) {
  return (
    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white p-10 lg:w-[380px] flex-shrink-0 relative overflow-hidden">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/5 rounded-full" />
      <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/5 rounded-full" />
      <div className="absolute top-1/2 right-0 w-32 h-32 bg-white/5 rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-blue-600 text-2xl font-black">V</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">{clinic.name}</h1>
            <p className="text-blue-200 text-sm">Clínica Dental</p>
          </div>
        </div>

        <h2 className="text-3xl font-bold leading-tight mb-3">
          Agenda tu cita<br /><span className="text-blue-200">en minutos</span>
        </h2>
        <p className="text-blue-100 text-sm leading-relaxed mb-8">
          Selecciona el servicio, fecha y horario que más te convenga. Sin llamadas, sin esperas.
        </p>

        <div className="flex items-center gap-2 mb-6">
          {[...Array(5)].map((_, i) => (
            <Star key={i} className="w-4 h-4 text-amber-300 fill-amber-300" />
          ))}
          <span className="text-blue-100 text-sm ml-1">500+ pacientes felices</span>
        </div>

        <div className="space-y-3">
          {[
            'Confirmación instantánea por WhatsApp',
            'Cancelación gratuita hasta 2 horas antes',
            'Estacionamiento gratuito disponible',
          ].map(item => (
            <div key={item} className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <span className="text-blue-100 text-sm">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 space-y-3">
        <div className="h-px bg-white/20 mb-4" />
        <div className="flex items-center gap-3 text-blue-100 text-sm">
          <MapPin className="w-4 h-4 flex-shrink-0" />
          <span>{clinic.address}</span>
        </div>
        <div className="flex items-center gap-3 text-blue-100 text-sm">
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{clinic.phone}</span>
        </div>
        <div className="flex items-center gap-3 text-blue-100 text-sm">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>Lun – Sáb · 9:00 AM – 7:00 PM</span>
        </div>
      </div>
    </div>
  )
}

// ─── Step 1: Service selection ────────────────────────────────────────────────

function ServiceStep({ onSelect }: { onSelect: (s: Service) => void }) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h3 className="text-2xl font-bold text-gray-900 mb-1">Qué servicio necesitas?</h3>
      <p className="text-gray-500 text-sm mb-6">Selecciona el tratamiento para ver disponibilidad</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SERVICES.map(s => {
          const a = ACCENT[s.accent]
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s)}
              className={`group relative text-left p-4 rounded-2xl border-2 border-gray-100 bg-white transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:${a.border} hover:${a.bg}`}
            >
              {s.tag && (
                <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-0.5 rounded-full ${a.badge}`}>{s.tag}</span>
              )}
              <div className="text-2xl mb-2">{s.emoji}</div>
              <div className="font-semibold text-gray-900 text-sm pr-12">{s.label}</div>
              <div className="text-xs text-gray-500 mt-0.5 pr-12">{s.desc}</div>
              <div className={`flex items-center gap-1 mt-2 text-xs font-medium text-gray-400 group-hover:${a.text} transition-colors`}>
                <Clock className="w-3.5 h-3.5" />
                {s.duration} min
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 2: Date + Time ──────────────────────────────────────────────────────

function DateTimeStep({
  service, clinicId, onSelect, onBack,
}: {
  service: Service; clinicId: string
  onSelect: (date: string, time: string) => void; onBack: () => void
}) {
  const today = new Date()
  const [calYear,  setCalYear]  = useState(today.getFullYear())
  const [calMonth, setCalMonth] = useState(today.getMonth())
  const [selDate,  setSelDate]  = useState<string | null>(null)
  const [selTime,  setSelTime]  = useState<string | null>(null)
  const [busy,     setBusy]     = useState<BusySlot[]>([])
  const [loading,  setLoading]  = useState(false)

  const cells   = getMonthCells(calYear, calMonth)
  const todayStr = toDateStr(today)
  const allSlots = generateTimeSlots()

  const fetchBusy = useCallback(async (date: string) => {
    setLoading(true)
    setSelTime(null)
    try {
      const res  = await fetch(`/api/booking/slots?date=${date}&clinicId=${clinicId}`)
      const json = await res.json()
      setBusy(json.slots ?? [])
    } finally { setLoading(false) }
  }, [clinicId])

  function pickDate(d: Date) {
    const str = toDateStr(d)
    setSelDate(str)
    fetchBusy(str)
  }

  function prevMonth() {
    if (calMonth === 0) { setCalYear(y => y - 1); setCalMonth(11) }
    else setCalMonth(m => m - 1)
  }
  function nextMonth() {
    if (calMonth === 11) { setCalYear(y => y + 1); setCalMonth(0) }
    else setCalMonth(m => m + 1)
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Elige fecha y hora</h3>
          <p className="text-gray-500 text-sm">{service.emoji} {service.label} · {service.duration} min</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mini calendar */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-white transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <span className="font-semibold text-gray-900 text-sm">{MONTHS_ES[calMonth]} {calYear}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-white transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS_ES.map(d => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {cells.map((date, i) => {
              if (!date) return <div key={`e-${i}`} />
              const str      = toDateStr(date)
              const isPast   = str < todayStr
              const isSun    = date.getDay() === 0
              const isToday  = str === todayStr
              const isSel    = str === selDate
              const disabled = isPast || isSun
              return (
                <button
                  key={str}
                  disabled={disabled}
                  onClick={() => pickDate(date)}
                  className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-150
                    ${disabled ? 'text-gray-300 cursor-not-allowed' :
                      isSel    ? 'bg-blue-600 text-white shadow-md shadow-blue-200 scale-105' :
                      isToday  ? 'bg-blue-100 text-blue-700 font-bold' :
                                 'text-gray-700 hover:bg-white hover:shadow-sm'}`}
                >
                  {date.getDate()}
                  {isToday && !isSel && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time slots */}
        <div>
          {!selDate ? (
            <div className="h-full min-h-[200px] flex items-center justify-center text-gray-400 text-sm bg-gray-50 rounded-2xl p-6 text-center">
              <div>
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                Selecciona una fecha para ver los horarios disponibles
              </div>
            </div>
          ) : loading ? (
            <div className="h-full min-h-[200px] flex items-center justify-center bg-gray-50 rounded-2xl">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">{formatDate(selDate)}</p>
              <div className="grid grid-cols-3 gap-2 max-h-[280px] overflow-y-auto pr-1">
                {allSlots.map(slot => {
                  const occupied = isSlotBusy(slot, selDate, busy, service.duration)
                  const isSel    = slot === selTime
                  return (
                    <button
                      key={slot}
                      disabled={occupied}
                      onClick={() => setSelTime(slot)}
                      className={`py-2.5 rounded-xl text-xs font-semibold border-2 transition-all duration-150
                        ${occupied ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50 line-through' :
                          isSel    ? 'border-blue-600 bg-blue-600 text-white shadow-md' :
                                     'border-gray-200 text-gray-700 hover:border-blue-400 hover:text-blue-600 bg-white'}`}
                    >
                      {formatTime(slot)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {selDate && selTime && (
        <div className="mt-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <button
            onClick={() => onSelect(selDate, selTime)}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-2xl transition-all duration-150 hover:shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2"
          >
            Continuar — {formatDate(selDate)} a las {formatTime(selTime)}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Step 3: Patient info ─────────────────────────────────────────────────────

function PatientStep({
  service, date, time, clinicId, onConfirmed, onBack,
}: {
  service: Service; date: string; time: string; clinicId: string
  onConfirmed: (id: string) => void; onBack: () => void
}) {
  const [form,    setForm]    = useState({ name: '', phone: '', email: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function set(field: string, val: string) {
    setForm(f => ({ ...f, [field]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString()
    try {
      const res = await fetch('/api/booking/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinicId,
          fullName:    form.name,
          phone:       form.phone,
          email:       form.email || '',
          scheduledAt,
          durationMin: service.duration,
          serviceType: service.label,
          notes:       form.notes || null,
        }),
      })
      const data = await res.json()
      if (data.success) onConfirmed(data.appointment_id)
      else setError(data.error ?? 'Error al agendar. Intenta de nuevo.')
    } catch {
      setError('Error de conexión. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h3 className="text-2xl font-bold text-gray-900">Tus datos</h3>
          <p className="text-gray-500 text-sm">Solo te tomará un momento</p>
        </div>
      </div>

      {/* Booking summary */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-xl">{service.emoji}</span>
          <div>
            <p className="font-semibold text-gray-900">{service.label}</p>
            <p className="text-gray-500 text-xs">{service.duration} min</p>
          </div>
        </div>
        <div className="hidden sm:block w-px h-8 bg-blue-200" />
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Calendar className="w-4 h-4 text-blue-500" />
          {formatDate(date)}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <Clock className="w-4 h-4 text-blue-500" />
          {formatTime(time)}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Nombre completo *</label>
            <input
              required value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="María García López"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Teléfono / WhatsApp *</label>
            <input
              required value={form.phone} onChange={e => set('phone', e.target.value)}
              placeholder="+52 55 1234 5678" type="tel"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Correo electrónico <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <input
            value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="maria@email.com" type="email"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">
            Algo que deba saber tu dentista? <span className="text-gray-400 font-normal">(opcional)</span>
          </label>
          <textarea
            value={form.notes} onChange={e => set('notes', e.target.value)}
            placeholder="Alergias, motivo de consulta, dolor específico..."
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
          />
        </div>
        <button
          type="submit" disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-all duration-150 hover:shadow-lg hover:shadow-blue-200 flex items-center justify-center gap-2"
        >
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Agendando...</>
            : <>Confirmar cita <ChevronRight className="w-4 h-4" /></>}
        </button>
        <p className="text-center text-xs text-gray-400">
          Al confirmar aceptas que te contactemos para recordatorios por WhatsApp
        </p>
      </form>
    </div>
  )
}

// ─── Confirmation ─────────────────────────────────────────────────────────────

function ConfirmationScreen({
  service, date, time, clinic,
}: {
  service: Service; date: string; time: string; clinic: Clinic
}) {
  const waText = encodeURIComponent(
    `Hola! Acabo de agendar una cita de ${service.label} el ${formatDate(date)} a las ${formatTime(time)} en ${clinic.name}`
  )
  const waUrl = `https://wa.me/${clinic.phone.replace(/\D/g, '')}?text=${waText}`

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500 text-center py-6">
      <div className="relative mx-auto w-24 h-24 mb-6">
        <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-30" />
        <div className="relative w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-xl shadow-green-200">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-2">Cita agendada! 🎉</h3>
      <p className="text-gray-500 text-sm mb-8 max-w-xs mx-auto">
        Te esperamos en {clinic.name}. Recibirás un recordatorio antes de tu cita.
      </p>

      <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-4 max-w-sm mx-auto border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm border border-gray-100">
            {service.emoji}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{service.label}</p>
            <p className="text-xs text-gray-500">{service.duration} min</p>
          </div>
        </div>
        <div className="h-px bg-gray-200" />
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{formatDate(date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="font-medium">{formatTime(time)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <MapPin className="w-4 h-4 text-blue-500" />
            <span>{clinic.address}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
        <a
          href={waUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          <span>📲</span> Confirmar por WhatsApp
        </a>
        <button
          onClick={() => window.location.reload()}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-xl border border-gray-200 transition-colors text-sm"
        >
          Agendar otra cita
        </button>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function BookingPage({ clinic }: { clinic: Clinic }) {
  type Step = 1 | 2 | 3 | 'confirmed'
  const [step,    setStep]    = useState<Step>(1)
  const [service, setService] = useState<Service | null>(null)
  const [date,    setDate]    = useState('')
  const [time,    setTime]    = useState('')

  return (
    <div className="min-h-screen bg-gray-100 flex items-stretch">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-10 flex items-center gap-3 px-4 h-14 bg-white border-b border-gray-100 shadow-sm">
        <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
          <span className="text-white font-black text-base">V</span>
        </div>
        <span className="font-bold text-gray-900">{clinic.name}</span>
        <span className="ml-auto text-xs text-gray-400">Clínica Dental</span>
      </div>

      <div className="flex w-full max-w-5xl mx-auto min-h-screen lg:shadow-2xl lg:my-12 lg:rounded-3xl overflow-hidden">
        <LeftPanel clinic={clinic} />

        {/* Right panel */}
        <div className="flex-1 bg-white p-6 sm:p-10 overflow-y-auto pt-20 lg:pt-10">
          {step !== 'confirmed' && <StepIndicator current={step as number} />}

          {step === 1 && (
            <ServiceStep onSelect={s => { setService(s); setStep(2) }} />
          )}
          {step === 2 && service && (
            <DateTimeStep
              service={service}
              clinicId={clinic.id}
              onBack={() => setStep(1)}
              onSelect={(d, t) => { setDate(d); setTime(t); setStep(3) }}
            />
          )}
          {step === 3 && service && (
            <PatientStep
              service={service}
              date={date}
              time={time}
              clinicId={clinic.id}
              onBack={() => setStep(2)}
              onConfirmed={() => setStep('confirmed')}
            />
          )}
          {step === 'confirmed' && service && (
            <ConfirmationScreen service={service} date={date} time={time} clinic={clinic} />
          )}
        </div>
      </div>
    </div>
  )
}
