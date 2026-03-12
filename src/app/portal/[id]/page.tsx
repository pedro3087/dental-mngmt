import { Sparkles, ArrowLeft, Calendar, FileText, CheckCircle2, CircleDashed } from 'lucide-react'
import { PatientChatbot } from '@/features/patient-portal/components/PatientChatbot'
import { getJourneyByShareToken } from '@/actions/clinical'
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

  const patient = journey.patients
  // @ts-ignore
  const milestones = journey.treatment_milestones || []

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center text-gray-900 font-sans selection:bg-pink-100 relative">
      {/* Contenedor Mobile-First (Emulando la vista de un smartphone) */}
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-br from-pink-500 via-rose-500 to-orange-400 rounded-b-[3rem] opacity-90"></div>

        {/* Top Navbar */}
        <div className="relative z-10 px-6 pt-12 pb-6 text-white flex justify-between items-center">
          <div>
            <p className="text-white/80 text-sm font-medium mb-1">Tu Tratamiento, {patient?.first_name || 'Paciente'}</p>
            <h1 className="text-2xl font-black">{journey.title}</h1>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="relative z-10 flex-1 overflow-y-auto px-6 pb-24 space-y-8 scrollbar-hide">
          
          {/* Tracker Card */}
          <div className="bg-white rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 mt-2">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" /> Progreso Visual
              </h2>
              <span className="text-pink-600 bg-pink-50 px-2.5 py-1 rounded-lg text-xs font-black">
                {journey.progress_percentage}% completado
              </span>
            </div>
            
            <div className="w-full h-48 bg-gray-100 rounded-2xl overflow-hidden relative group">
              {/* Imagen Fija Simulando Comparación - En un componente real usaríamos el slider aquí */}
              <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1606811841689-23dfddce3e95?q=80&w=800&auto=format&fit=crop)' }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                   <p className="text-white font-medium text-sm">Mes 6 (Actual)</p>
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-gray-400 mt-3 font-medium">✨ Tu sonrisa está evolucionando según lo planeado.</p>
          </div>

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
      <PatientChatbot />
    </div>
  )
}
