'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

// Representación de dientes por cuadrantes
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11]
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28]
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41]
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38]

type ToothStatus = 'healthy' | 'caries' | 'filled' | 'extracted' | 'crown'

const STATUS_COLORS: Record<ToothStatus, string> = {
  healthy: 'bg-white border-gray-300 text-gray-500',
  caries: 'bg-red-100 border-red-500 text-red-700 font-bold',
  filled: 'bg-blue-100 border-blue-500 text-blue-700 font-bold',
  extracted: 'bg-gray-100 border-gray-400 text-gray-400 opacity-50',
  crown: 'bg-amber-100 border-amber-500 text-amber-700 font-bold',
}

const STATUS_LABELS: Record<ToothStatus, string> = {
  healthy: 'Sano',
  caries: 'Caries',
  filled: 'Obturación',
  extracted: 'Extraído',
  crown: 'Corona',
}

export function Odontogram() {
  const [teeth, setTeeth] = useState<Record<number, ToothStatus>>({
    16: 'caries',
    21: 'filled',
    38: 'extracted',
    46: 'crown'
  })

  const [activeTooth, setActiveTooth] = useState<number | null>(null)

  const handleToothClick = (id: number) => {
    setActiveTooth(activeTooth === id ? null : id)
  }

  const changeStatus = (id: number, status: ToothStatus) => {
    setTeeth(prev => ({ ...prev, [id]: status }))
    setActiveTooth(null)
  }

  const renderQuadrant = (ids: number[], reverse = false) => {
    const sorted = reverse ? [...ids].reverse() : ids
    
    return (
      <div className="flex gap-2">
        {sorted.map(id => {
          const status = teeth[id] || 'healthy'
          const isActive = activeTooth === id

          return (
            <div key={id} className="relative flex flex-col items-center">
              <span className="text-xs font-semibold text-gray-400 mb-2">{id}</span>
              <button
                onClick={() => handleToothClick(id)}
                className={`w-10 h-14 rounded-t-lg rounded-b-md border-2 transition-all duration-200 
                  ${STATUS_COLORS[status]} 
                  ${isActive ? 'ring-4 ring-blue-300 scale-110 z-10' : 'hover:scale-105'}
                `}
              >
                {status === 'extracted' && <span className="text-2xl font-bold block leading-none pt-2">X</span>}
              </button>

              {/* Popover Menu */}
              {isActive && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-24 left-1/2 -translate-x-1/2 bg-white shadow-xl rounded-xl border border-gray-100 p-2 z-50 flex flex-col w-36 gap-1"
                >
                  <div className="text-xs font-bold text-center text-gray-500 mb-1 border-b pb-1">
                    Pieza {id}
                  </div>
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <button
                      key={val}
                      onClick={() => changeStatus(id, val as ToothStatus)}
                      className={`text-xs px-2 py-1.5 rounded-lg text-left hover:bg-gray-50 ${(teeth[id] || 'healthy') === val ? 'font-bold text-blue-600 bg-blue-50' : 'text-gray-700'}`}
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
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col items-center relative gap-8">
      
      <div className="w-full flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-900">Odontograma Interactivo</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-red-400"></div> Caries</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-blue-400"></div> Obturación</div>
          <div className="flex items-center gap-1.5 text-xs font-semibold"><div className="w-3 h-3 rounded-full bg-amber-400"></div> Corona</div>
        </div>
      </div>

      <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 w-full flex flex-col items-center gap-12 relative overflow-visible">
        {/* Superior */}
        <div className="flex gap-8 justify-center items-end border-b-2 border-gray-200 pb-4">
          {renderQuadrant(UPPER_RIGHT)}
          <div className="w-px h-20 bg-gray-200 mx-2"></div>
          {renderQuadrant(UPPER_LEFT, true)}
        </div>

        {/* Inferior */}
        <div className="flex gap-8 justify-center items-start pt-4 border-t-2 border-transparent">
          {renderQuadrant(LOWER_RIGHT)}
          <div className="w-px h-20 bg-gray-200 mx-2"></div>
          {renderQuadrant(LOWER_LEFT, true)}
        </div>
      </div>
    </div>
  )
}
