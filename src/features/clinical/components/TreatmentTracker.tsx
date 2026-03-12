'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { Plus, CheckCircle2, Clock, Upload, CircleDashed, Camera, ExternalLink, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { updateMilestoneStatus, updateJourneyProgress } from '@/actions/clinical'

// Tipos basados en la DB
type Milestone = {
  id: string
  title: string
  milestone_date: string | null
  status: 'pending' | 'current' | 'completed'
  order_index: number
}

type Journey = {
  id: string
  title: string
  progress_percentage: number
  status: string
  share_token: string
  treatment_milestones: Milestone[]
}

export function TreatmentTracker({ initialTreatments, patientId }: { initialTreatments: any[], patientId: string }) {
  const [journeys, setJourneys] = useState<Journey[]>(initialTreatments)
  const [activeJourneyId, setActiveJourneyId] = useState<string>(journeys[0]?.id || '')
  const [isPending, startTransition] = useTransition()

  const activeJourney = journeys.find(j => j.id === activeJourneyId)
  const milestones = activeJourney?.treatment_milestones?.sort((a,b) => a.order_index - b.order_index) || []
  const progress = activeJourney?.progress_percentage || 0

  const handleStatusChange = async (milestoneId: string, currentStatus: string) => {
    let newStatus: 'pending' | 'current' | 'completed' = 'pending'
    if (currentStatus === 'pending') newStatus = 'current'
    if (currentStatus === 'current') newStatus = 'completed'
    
    // Optimizacion UI primero
    setJourneys(prev => prev.map(j => {
      if (j.id !== activeJourneyId) return j
      return {
        ...j,
        treatment_milestones: j.treatment_milestones.map(m => 
          m.id === milestoneId ? { ...m, status: newStatus } : m
        )
      }
    }))

    startTransition(async () => {
       await updateMilestoneStatus(milestoneId, newStatus)
    })
  }

  const handleProgressChange = () => {
    const newProgress = Math.min(100, progress + 10)
    
    // Optimistic UI Update
    setJourneys(prev => prev.map(j => {
      if (j.id !== activeJourneyId) return j
      return { ...j, progress_percentage: newProgress }
    }))

    startTransition(async () => {
       await updateJourneyProgress(activeJourneyId, newProgress)
    })
  }

  if (!activeJourney) return <div className="p-4 bg-gray-50 rounded-xl">No hay tratamientos registrados.</div>

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Control de Tratamientos
            <span className="bg-pink-100 text-pink-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide border border-pink-200">Smile Tracker</span>
          </h3>
          <div className="mt-2 text-sm text-gray-500 flex items-center gap-2">
            <select 
              value={activeJourneyId}
              onChange={(e) => setActiveJourneyId(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2 outline-none font-semibold cursor-pointer max-w-xs"
            >
              {journeys.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>
            <span className="text-xs shrink-0">({journeys.length} disponibles)</span>
          </div>
        </div>
        
        {/* Link para ver el portal del paciente simulado */}
        <Link href={`/portal/${activeJourney.share_token}`} target="_blank" className="flex items-center gap-2 bg-pink-50 text-pink-600 hover:bg-pink-100 px-4 py-2 rounded-xl font-bold transition-colors text-sm border border-pink-200">
          <ExternalLink className="w-4 h-4" /> Ver Portal del Tratamiento
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Panel Izquierdo: Timeline de gestión */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h4 className="font-bold text-gray-900">Timeline del Paciente</h4>
            <button className="text-sm text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-4 h-4" /> Añadir Hito
            </button>
          </div>
          
          <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:to-transparent">
            {milestones.map((item) => (
              <div key={item.id} className="relative flex items-center gap-4 group cursor-pointer" onClick={() => handleStatusChange(item.id, item.status)}>
                <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 border-white shadow-sm z-10 transition-colors
                  ${item.status === 'completed' ? 'bg-emerald-500' : 
                    item.status === 'current' ? 'bg-pink-500 ring-4 ring-pink-100' : 
                    'bg-gray-200'}`}
                >
                  {item.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                  {item.status === 'current' && <Clock className="w-3 h-3 text-white" />}
                  {item.status === 'pending' && <CircleDashed className="w-3 h-3 text-gray-500" />}
                </div>
                
                <div className="flex-1 bg-gray-50 hover:bg-gray-100 p-3 rounded-2xl border border-gray-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <p className={`font-semibold text-sm ${item.status === 'pending' ? 'text-gray-500' : 'text-gray-900'}`}>
                      {item.title}
                    </p>
                    <span className="text-xs text-gray-400 font-medium">{item.milestone_date || 'Por definir'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Panel Derecho: Fotos y Progreso */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-end mb-2">
              <h4 className="font-bold text-gray-900">Progreso Global ({progress}%)</h4>
              <button 
                onClick={handleProgressChange} 
                disabled={isPending}
                className="text-xs text-gray-500 hover:text-gray-900 font-semibold underline disabled:opacity-50"
              >
                Actualizar manualmente
              </button>
            </div>
            <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-gradient-to-r from-pink-400 to-rose-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          <div>
             <h4 className="font-bold text-gray-900 mb-3">Evidencia Clínica (Smile Tracker)</h4>
             <div className="grid grid-cols-2 gap-3">
               
               {/* Visor Foto Before */}
               <div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 group">
                  <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-1 flex items-center gap-1 rounded font-bold backdrop-blur-sm z-10 uppercase tracking-wider">Inicio</div>
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop&grayscale=true)' }} // Simular foto vieja
                  />
               </div>

                {/* Subir nueva foto */}
               <label className="relative aspect-video bg-blue-50 hover:bg-blue-100 border-2 border-dashed border-blue-200 hover:border-blue-400 rounded-2xl flex flex-col items-center justify-center text-blue-600 transition-colors cursor-pointer group">
                 <Camera className="w-8 h-8 mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                 <span className="text-xs font-bold uppercase tracking-wider">Subir Etapa</span>
                 <input type="file" className="hidden" accept="image/*" />
               </label>

             </div>
             
             <button className="w-full mt-4 bg-gray-900 hover:bg-black text-white px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
               <Upload className="w-4 h-4" /> Publicar actualización al Paciente
             </button>
          </div>
        </div>
      </div>
    </div>
  )
}
