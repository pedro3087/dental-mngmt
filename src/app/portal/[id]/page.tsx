import { CheckCircle2 } from 'lucide-react'
import { PatientChatbot } from '@/features/patient-portal/components/PatientChatbot'
import { SmileTracker } from '@/features/patient-portal/components/SmileTracker'
import { getJourneyByShareToken } from '@/actions/clinical'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const metadata = {
  title: 'Mi Portal Clínico | VitalDent',
}

export default async function PatientPortalPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params
  const shareToken = resolvedParams.id
  const journey = await getJourneyByShareToken(shareToken)

  if (!journey) {
     return notFound()
  }

  const patient = journey.patients as { full_name: string } | null
  // @ts-ignore
  const milestones = journey.treatment_milestones || []
  const nextMilestone = milestones.find((m: { status: string; milestone_date?: string }) => m.status === 'current' || m.status === 'pending')
  const completedMilestones = milestones.filter((m: { status: string }) => m.status === 'completed').length
  const totalMilestones = milestones.length

  // Fetch chatbot greeting + ai settings (anon-accessible)
  const clinicId: string = journey.clinic_id
  let chatbotGreeting: string | undefined
  let patientBotEnabled = true
  try {
    const supabase = await createClient()
    const [notifRes, aiRes] = await Promise.all([
      supabase.from('notification_settings').select('chatbot_greeting').eq('clinic_id', clinicId).single(),
      supabase.from('ai_settings').select('patient_bot_enabled').eq('clinic_id', clinicId).single(),
    ])
    chatbotGreeting = notifRes.data?.chatbot_greeting ?? undefined
    patientBotEnabled = aiRes.data?.patient_bot_enabled ?? true
  } catch { /* fallback to defaults */ }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center text-gray-900 font-sans selection:bg-pink-100 relative">
      {/* Contenedor Mobile-First (Emulando la vista de un smartphone) */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col overflow-hidden">

        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 rounded-b-[3rem] opacity-90"></div>

        {/* Top Navbar */}
        <div className="relative z-10 px-6 pt-12 pb-6 text-white flex justify-between items-center">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Tu Tratamiento, {patient?.full_name?.split(' ')[0] || 'Paciente'}</p>
            <h1 className="text-2xl font-black">{journey.title}</h1>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-24 space-y-8 scrollbar-hide">
          
          <SmileTracker
            progress={journey.progress_percentage}
            completedMilestones={completedMilestones}
            totalMilestones={totalMilestones}
            nextAppointment={nextMilestone?.milestone_date ?? null}
          />

          {/* Timeline de Tratamiento */}
          <div>
            <h3 className="font-bold text-gray-900 mb-5 px-1">Ruta de tu Tratamiento</h3>
            <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[13px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                
                {milestones.map((item: any) => (
                  <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    {/* Icono Redondo */}
                    <div className={`flex items-center justify-center w-7 h-7 rounded-full border-4 border-white z-10 
                      ${item.status === 'completed' ? 'bg-emerald-500' : 
                        item.status === 'current' ? 'bg-pink-500 ring-4 ring-pink-100' : 
                        'bg-gray-200'} shrink-0`}
                    >
                      {item.status === 'completed' && <CheckCircle2 className="w-4 h-4 text-white" />}
                      {item.status === 'current' && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                    </div>

                    {/* Contenido del Hito */}
                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-2rem)] p-4 rounded-2xl bg-gray-50 border border-gray-100 shadow-sm ml-4">
                      <div className="flex items-center justify-between text-xs mb-1 text-gray-500 font-bold uppercase tracking-wider">
                         <span>{item.milestone_date || 'Por definir'}</span>
                         {item.status === 'current' && <span className="text-pink-600">ETAPA ACTUAL</span>}
                      </div>
                      <h4 className={`font-bold ${item.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}`}>{item.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      
      {/* Footer Chat Flotante */}
      {patientBotEnabled && (
        <PatientChatbot
          patientName={patient?.full_name?.split(' ')[0]}
          treatmentTitle={journey.title}
          nextAppointment={nextMilestone?.milestone_date}
          clinicId={clinicId}
          greeting={chatbotGreeting}
        />
      )}
    </div>
  )
}
