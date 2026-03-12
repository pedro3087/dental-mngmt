'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ScanFace, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'

export function SmileTrackerPreview() {
  const [sliderPosition, setSliderPosition] = useState(50)

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <ScanFace className="w-6 h-6 text-pink-500" />
            Tracker de Sonrisa
          </h3>
          <p className="text-sm text-gray-500 mt-1">Vista previa del portal del paciente.</p>
        </div>
        <button className="bg-pink-50 text-pink-600 hover:bg-pink-100 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2">
          <Share2 className="w-4 h-4" /> Compartir Link
        </button>
      </div>

      <div className="relative flex-1 w-full bg-gray-100 rounded-2xl overflow-hidden min-h-[300px] mb-6 select-none group">
        
        {/* Imagen "Antes" (Fondo) */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?q=80&w=800&auto=format&fit=crop)' }}
        >
          <div className="absolute inset-0 bg-amber-900/40 mix-blend-multiply"></div>
          <span className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">Antes (Mes 1)</span>
        </div>

        {/* Imagen "Después" (Superpuesta y recortada) */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: 'url(https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop)',
            clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` // Corta desde la derecha
          }}
        >
          <div className="absolute inset-0 bg-blue-900/10 mix-blend-color"></div>
          <span className="absolute top-4 right-4 bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Ahora (Mes 6)
          </span>
        </div>

        {/* Barra del Slider */}
        <div 
          className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize shadow-[0_0_10px_rgba(0,0,0,0.5)] flex items-center justify-center pointer-events-none"
          style={{ left: `calc(${sliderPosition}% - 2px)` }}
        >
          <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400">
            <ChevronLeft className="w-4 h-4 -mr-1" />
            <ChevronRight className="w-4 h-4 -ml-1" />
          </div>
        </div>

        {/* Input Rango Invisible para controlarlo */}
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={sliderPosition} 
          onChange={(e) => setSliderPosition(Number(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize"
        />
      </div>

      <div className="grid grid-cols-3 gap-2 text-center bg-gray-50 rounded-2xl p-4">
        <div>
          <p className="text-xs text-gray-500 font-medium">Progreso total</p>
          <p className="text-xl font-black text-emerald-500">65%</p>
        </div>
        <div className="border-x border-gray-200">
          <p className="text-xs text-gray-500 font-medium">Alineadores</p>
          <p className="text-xl font-black text-blue-600">12 / 24</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 font-medium">Próximo</p>
          <p className="text-sm font-bold text-gray-900 mt-1">20 Mar</p>
        </div>
      </div>
    </div>
  )
}
