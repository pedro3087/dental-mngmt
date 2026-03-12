import { AnamnesisForm } from '@/features/clinical/components/AnamnesisForm'
import { Odontogram } from '@/features/clinical/components/Odontogram'
import { TreatmentTracker } from '@/features/clinical/components/TreatmentTracker'
import { FileDown, Printer, UserCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPatientTreatmentJourneys } from '@/actions/clinical'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const metadata = {
  title: 'Expediente Clínico Digital | VitalDent',
}

export default async function ClinicalRecordPage({ params }: { params: Promise<{ patientId: string }> }) {
  const resolvedParams = await params
  const supabase = await createClient()

  // Fetch the specific patient
  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', resolvedParams.patientId)
    .single()

  if (!patient) {
     return notFound()
  }

  // Fetch treatments logic (creates one dummy treatment if none exists)
  const treatments = await getPatientTreatmentJourneys(patient.id)

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      
      {/* Header del Expediente */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 mb-8 bg-blue-600 rounded-3xl p-6 text-white shadow-lg overflow-hidden relative">
        <div className="absolute right-0 top-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] w-full h-full mix-blend-overlay pointer-events-none"></div>
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
          <Link href="/clinical" className="p-2 hover:bg-white/20 rounded-full transition-colors mr-2">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
            <UserCircle className="w-12 h-12 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-3xl font-bold tracking-tight">{`${patient.first_name} ${patient.last_name}`}</h2>
              {treatments.length > 0 && <span className="bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-sm">Tratamiento Activo</span>}
            </div>
            <p className="text-blue-100 mt-1 font-medium text-sm flex gap-4">
              <span>ID: {patient.id.split('-')[0].toUpperCase()}</span>
              <span>•</span>
              <span>TLF: {patient.phone || 'Sin registrar'}</span>
            </p>
          </div>
        </div>
        
        <div className="flex gap-2 relative z-10">
          <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/20 font-medium shadow-sm transition-colors flex items-center gap-2">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button className="bg-white text-blue-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-bold shadow-sm transition-colors flex items-center gap-2">
            <FileDown className="w-4 h-4" /> NOM-013
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        {/* Columna Izquierda: Anamnesis e Historial */}
        <div className="space-y-6 flex flex-col h-full">
          <AnamnesisForm />
        </div>

        {/* Columna Derecha: Odontograma e Imágenes */}
        <div className="space-y-6">
          <Odontogram />
          {/* Tracking y Smile Tracker (Control del Dentista) */}
          <TreatmentTracker initialTreatments={treatments} patientId={patient.id} />
        </div>
      </div>
    </div>
  )
}
