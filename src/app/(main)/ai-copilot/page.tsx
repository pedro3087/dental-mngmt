import { DentistCopilot } from '@/features/ai-copilot/components/DentistCopilot'
import { SmileTrackerPreview } from '@/features/ai-copilot/components/SmileTrackerPreview'
import { getAiSettings } from '@/actions/settings'

export const metadata = {
  title: 'AI Suite | VitalDent',
}

export default async function AiCopilotPage() {
  const aiSettings = await getAiSettings().catch(() => null)
  return (
    <div className="flex-1 space-y-4 p-8 pt-6 h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center justify-between space-y-2 mb-4 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            AI Suite
            <span className="bg-gradient-to-r from-pink-500 to-violet-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-widest shadow-lg shadow-pink-500/20">Vercel AI SDK</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">Visualiza el agente inteligente (RAG) que asiste al dentista durante la consulta, y la vista que reciben los pacientes para ver su Tracker de Sonrisa.</p>
        </div>
      </div>

      {/* Bento Grid Principal: 2/3 para Chat IA, 1/3 para Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 flex-1 min-h-[500px]">
        {/* Panel Izquierdo: Chatbot RAG Copilot */}
        <div className="h-full">
          {aiSettings?.copilot_enabled === false ? (
            <div className="h-full flex items-center justify-center bg-gray-50 rounded-3xl border border-gray-100 text-gray-400 text-sm">
              Copiloto Clínico desactivado en Configuración → IA
            </div>
          ) : (
            <DentistCopilot quickPrompts={aiSettings?.quick_prompts} />
          )}
        </div>

        {/* Panel Derecho: Smile Tracker */}
        <div className="h-full">
          <SmileTrackerPreview />
        </div>
      </div>
    </div>
  )
}
