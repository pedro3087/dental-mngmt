'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { AgendaTimeline } from './AgendaTimeline'
import { NewAppointmentModal } from './NewAppointmentModal'
import type { Appointment } from '@/types/database'

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']

function toDateString(d: Date) {
  return d.toISOString().split('T')[0]
}

function getWeekDays(referenceDate: Date): Date[] {
  const day = referenceDate.getDay()
  const monday = new Date(referenceDate)
  monday.setDate(referenceDate.getDate() - day + (day === 0 ? -6 : 1))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    return d
  })
}

interface AgendaClientViewProps {
  initialAppointments: Appointment[]
  onFetchDay: (date: string) => Promise<Appointment[]>
}

export function AgendaClientView({ initialAppointments, onFetchDay }: AgendaClientViewProps) {
  const today = new Date()
  const [selectedDate, setSelectedDate] = useState(toDateString(today))
  const [weekRef, setWeekRef] = useState(today)
  const [appointments, setAppointments] = useState(initialAppointments)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const weekDays = getWeekDays(weekRef)

  useEffect(() => {
    onFetchDay(selectedDate)
      .then(data => {
        setAppointments(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function selectDay(date: Date) {
    const dateStr = toDateString(date)
    setSelectedDate(dateStr)
    setLoading(true)
    const data = await onFetchDay(dateStr)
    setAppointments(data)
    setLoading(false)
  }

  function prevWeek() {
    const d = new Date(weekRef)
    d.setDate(d.getDate() - 7)
    setWeekRef(d)
  }

  function nextWeek() {
    const d = new Date(weekRef)
    d.setDate(d.getDate() + 7)
    setWeekRef(d)
  }

  const selectedDateObj = new Date(selectedDate + 'T12:00:00')

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Agenda Clínica</h2>
          <p className="text-sm text-gray-500 mt-1">
            {selectedDateObj.getDate()} de {MONTHS_ES[selectedDateObj.getMonth()]} de {selectedDateObj.getFullYear()}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Cita
        </button>
      </div>

      {/* Selector de semana */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4">
        <div className="flex items-center justify-between mb-3">
          <button onClick={prevWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          <span className="text-sm font-semibold text-gray-700 capitalize">
            {MONTHS_ES[weekRef.getMonth()]} {weekRef.getFullYear()}
          </span>
          <button onClick={nextWeek} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {weekDays.map((day) => {
            const dateStr = toDateString(day)
            const isToday = dateStr === toDateString(today)
            const isSelected = dateStr === selectedDate

            return (
              <button
                key={dateStr}
                onClick={() => selectDay(day)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : isToday
                    ? 'bg-blue-50 text-blue-600'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <span className="text-xs font-medium">{DAYS_ES[day.getDay()]}</span>
                <span className={`text-lg font-bold mt-0.5 ${isSelected ? 'text-white' : ''}`}>
                  {day.getDate()}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline del día */}
      <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-6 flex items-center gap-2">
          Citas del día
          <span className="bg-blue-100 text-blue-700 text-xs py-0.5 px-2 rounded-full font-bold">
            {appointments.length}
          </span>
        </h3>
        {loading ? (
          <div className="py-8 text-center text-gray-400 text-sm animate-pulse">Cargando citas...</div>
        ) : (
          <AgendaTimeline key={selectedDate} initialAppointments={appointments} />
        )}
      </div>

      <NewAppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={selectedDate}
        onCreated={async () => {
          setIsModalOpen(false)
          setLoading(true)
          const data = await onFetchDay(selectedDate)
          setAppointments(data)
          setLoading(false)
        }}
      />
    </div>
  )
}
