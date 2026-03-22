'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, CheckCircle2 } from 'lucide-react'
import { saveOdontogram } from '@/actions/clinical'

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11]
const UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41]
const LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38]

type ToothStatus = 'healthy' | 'caries' | 'filled' | 'extracted' | 'crown' | 'treatment'

const STATUS_COLORS: Record<ToothStatus, string> = {
  healthy:   'bg-white border-gray-300 text-gray-400',
  caries:    'bg-red-100 border-red-500 text-red-700',
  filled:    'bg-blue-100 border-blue-500 text-blue-700',
  extracted: 'bg-gray-100 border-gray-400 text-gray-400 opacity-50',
  crown:     'bg-amber-100 border-amber-500 text-amber-700',
  treatment: 'bg-violet-100 border-violet-500 text-violet-700',
}

const STATUS_LABELS: Record<ToothStatus, string> = {
  healthy:   'Sano',
  caries:    'Caries',
  filled:    'Obturación',
  extracted: 'Extraído',
  crown:     'Corona',
  treatment: 'En tratamiento',
}

interface OdontogramProps {
  patientId: string
  initialData?: Record<string, unknown>
}

export function Odontogram({ patientId, initialData }: OdontogramProps) {
  const [teeth, setTeeth] = useState<Record<number, ToothStatus>>(() => {
    if (!initialData) return {}
    const result: Record<number, ToothStatus> = {}
    for (const [key, val] of Object.entries(initialData)) {
      const tooth = (val as { status?: string })?.status
      if (tooth) result[Number(key)] = tooth as ToothStatus
    }
    return result
  })

  const [activeTooth, setActiveTooth] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function changeStatus(id: number, status: ToothStatus) {
    setTeeth(prev => ({ ...prev, [id]: status }))
    setActiveTooth(null)
  }

  async function handleSave() {
    setSaving(true)
    const payload: Record<string, unknown> = {}
    for (const [id, status] of Object.entries(teeth)) {
      payload[id] = { status }
    }
    await saveOdontogram(patientId, payload)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function renderQuadrant(ids: number[], reverse = false) {
    const sorted = reverse ? [...ids].reverse() : ids
    return (
      <div className="flex gap-1.5">
        {sorted.map(id => {
          const status = teeth[id] ?? 'healthy'
          const isActive = activeTooth === id
          return (
            <div key={id} className="relative flex flex-col items-center">
              <span className="text-[10px] font-semibold text-gray-400 mb-1">{id}</span>
              <button
                onClick={() => setActiveTooth(isActive ? null : id)}
                className={`w-9 h-12 rounded-t-lg rounded-b-sm border-2 transition-all duration-150
                  ${STATUS_COLORS[status]}
                  ${isActive ? 'ring-4 ring-blue-300 scale-110 z-10' : 'hover:scale-105'}
                `}
              >
                {status === 'extracted' && <span className="text-lg font-bold block leading-none">×</span>}
              </button>

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-20 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-xl border border-gray-100 p-2 z-50 flex flex-col w-36 gap-1"
                >
                  <div className="text-xs font-bold text-center text-gray-500 mb-1 border-b pb-1">Pieza {id}</div>
                  {(Object.entries(STATUS_LABELS) as [ToothStatus, string][]).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => changeStatus(id, val)}
                      className={`text-xs px-2 py-1.5 rounded-lg text-left hover:bg-gray-50 transition-colors
                        ${(teeth[id] ?? 'healthy') === val ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'}`}
                    >
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center gap-6">
      <div className="w-full flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-900">Odontograma</h3>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-3">
            {(['caries', 'filled', 'crown', 'treatment'] as ToothStatus[]).map(s => (
              <div key={s} className="flex items-center gap-1 text-xs font-medium text-gray-500">
                <div className={`w-3 h-3 rounded-full border ${STATUS_COLORS[s]}`} />
                {STATUS_LABELS[s]}
              </div>
            ))}
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50
              bg-gray-900 text-white hover:bg-black"
          >
            {saved
              ? <><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Guardado</>
              : <><Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar'}</>
            }
          </button>
        </div>
      </div>

      <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 w-full flex flex-col items-center gap-10 overflow-x-auto">
        {/* Superior */}
        <div className="flex gap-6 justify-center items-end border-b-2 border-dashed border-gray-200 pb-4">
          {renderQuadrant(UPPER_RIGHT)}
          <div className="w-px h-16 bg-gray-200" />
          {renderQuadrant(UPPER_LEFT, true)}
        </div>
        {/* Inferior */}
        <div className="flex gap-6 justify-center items-start pt-4">
          {renderQuadrant(LOWER_RIGHT)}
          <div className="w-px h-16 bg-gray-200" />
          {renderQuadrant(LOWER_LEFT, true)}
        </div>
      </div>
    </div>
  )
}
