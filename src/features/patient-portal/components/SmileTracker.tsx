'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ScanFace, ChevronLeft, ChevronRight } from 'lucide-react'

interface SmileTrackerProps {
  progress: number
  completedMilestones: number
  totalMilestones: number
  nextAppointment: string | null
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Sin cita'
  try {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  } catch {
    return dateStr
  }
}

export function SmileTracker({ progress, completedMilestones, totalMilestones, nextAppointment }: SmileTrackerProps) {
  const [sliderPosition, setSliderPosition] = useState(50)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <ScanFace className="w-5 h-5 text-pink-500" /> Tracker de Sonrisa
        </h2>
        <span className="text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg text-xs font-black">
          {progress}% completado
        </span>
      </div>

      {/* Slider antes/después */}
      <div className="relative w-full h-48 bg-gray-100 rounded-2xl overflow-hidden mb-4 select-none">
        {/* Imagen "Antes" */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop)' }}
        >
          <div className="absolute inset-0 bg-amber-900/40 mix-blend-multiply" />
          <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg">
            Antes (Mes 1)
          </span>
        </div>

        {/* Imagen "Después" recortada por slider */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop)',
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
          }}
        >
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-color" />
          <span className="absolute top-3 right-3 bg-pink-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Ahora
          </span>
        </div>

        {/* Barra del slider */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="w-7 h-7 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400">
            <ChevronLeft className="w-3 h-3 -mr-0.5" />
            <ChevronRight className="w-3 h-3 -ml-0.5" />
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          value={sliderPosition}
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-2xl p-4">
        <div>
          <p className="text-xs text-gray-500 font-medium">Progreso</p>
          <p className="text-xl font-black text-emerald-500">{progress}%</p>
        </div>
        <div className="border-x border-gray-200">
          <p className="text-xs text-gray-500 font-medium">Etapas</p>
          <p className="text-xl font-black text-blue-600">{completedMilestones} / {totalMilestones}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Próximo</p>
          <p className="text-sm font-bold text-gray-900 mt-1">{formatDate(nextAppointment)}</p>
        </div>
      </div>

      <p className="text-xs text-center text-gray-400 mt-3 font-medium">✨ Tu sonrisa está evolucionando según lo planeado.</p>
    </motion.div>
  )
}
