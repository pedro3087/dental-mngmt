import { AnamnesisForm } from '@/features/clinical/components/AnamnesisForm'
import { Odontogram } from '@/features/clinical/components/Odontogram'
import { TreatmentTracker } from '@/features/clinical/components/TreatmentTracker'
import { FileDown, Printer, UserCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getClinicalRecord, getPatientTreatmentJourneys } from '@/actions/clinical'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export const metadata = { title: 'Expediente Clínico | VitalDent' }
export const revalidate = 0

export default async function ClinicalRecordPage({ params }: { params: Promise<{ patientId: string }> }) {
  const { patientId } = await params
  const supabase = await createClient()

  const { data: patient } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single()

  if (!patient) return notFound()

  const [clinicalRecord, treatments] = await Promise.all([
    getClinicalRecord(patientId),
    getPatientTreatmentJourneys(patientId),
  ])

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-blue-600 rounded-3xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-4">
          <Link href="/clinical" className="p-2 hover:bg-white/20 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md shrink-0">
            <UserCircle className="w-10 h-10 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-bold">{patient.full_name}</h2>
              {treatments.length > 0 && (
                <span className="bg-emerald-500/20 text-emerald-100 border border-emerald-400/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Tratamiento Activo
                </span>
              )}
            </div>
            <p className="text-blue-100 mt-1 text-sm flex gap-4 flex-wrap">
              <span>ID: {patient.id.split('-')[0].toUpperCase()}</span>
              {patient.phone && <><span>•</span><span>{patient.phone}</span></>}
              {patient.email && <><span>•</span><span>{patient.email}</span></>}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl border border-white/20 font-medium text-sm transition-colors flex items-center gap-2">
            <Printer className="w-4 h-4" /> Imprimir
          </button>
          <button className="bg-white text-blue-700 hover:bg-gray-50 px-4 py-2 rounded-xl font-bold text-sm transition-colors flex items-center gap-2">
            <FileDown className="w-4 h-4" /> NOM-013
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6">
        {/* Anamnesis */}
        <AnamnesisForm
          patientId={patientId}
          initialData={patient.anamnesis as Record<string, unknown> | undefined}
        />

        {/* Odontograma + Tratamientos */}
        <div className="space-y-6">
          <Odontogram
            patientId={patientId}
            initialData={clinicalRecord?.odontogram as Record<string, unknown> | undefined}
          />
          <TreatmentTracker initialTreatments={treatments} patientId={patientId} />
        </div>
      </div>
    </div>
  )
}
