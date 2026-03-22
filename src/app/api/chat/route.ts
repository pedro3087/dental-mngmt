import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

async function getAiConfig(clinicId: string | null) {
  if (!clinicId) return { model: 'google/gemini-flash-1.5', clinicName: 'VitalDent' }
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('ai_settings')
      .select('ai_model, clinic_display_name')
      .eq('clinic_id', clinicId)
      .single()
    return {
      model:      data?.ai_model            ?? 'google/gemini-flash-1.5',
      clinicName: data?.clinic_display_name ?? 'VitalDent',
    }
  } catch {
    return { model: 'google/gemini-flash-1.5', clinicName: 'VitalDent' }
  }
}

const BASE_SYSTEM_PROMPT = (clinicName: string) =>
  `Eres el Copiloto Clínico de ${clinicName}, un asistente de IA especializado para dentistas y personal clínico.

Tu rol:
- Ayudar al dentista a consultar expedientes médicos de pacientes de forma rápida
- Analizar datos de anamnesis (alergias, medicamentos, enfermedades crónicas)
- Interpretar el odontograma y sugerir planes de tratamiento
- Revisar estadísticas de la clínica (ausentismo, ingresos, citas)
- Dar recomendaciones clínicas basadas en el historial del paciente

Reglas importantes:
- Siempre menciona las alergias y medicamentos del paciente antes de sugerir tratamientos
- Si hay contraindicaciones, advertir en términos claros
- Responde en español, de forma concisa y profesional
- No improvises datos — solo trabaja con la información del contexto proporcionado
- Si no tienes la información, dilo claramente y sugiere cómo obtenerla`

export async function POST(req: Request) {
  const { messages, patientContext, clinicId } = await req.json()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY no configurada' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const { model, clinicName } = await getAiConfig(clinicId ?? null)
  const systemPrompt = BASE_SYSTEM_PROMPT(clinicName)

  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
  })

  const systemWithContext = patientContext
    ? `${systemPrompt}\n\n## Contexto del Paciente Activo:\n${patientContext}`
    : systemPrompt

  const result = streamText({
    model: openrouter(model),
    system: systemWithContext,
    messages,
    maxOutputTokens: 800,
  })

  return result.toUIMessageStreamResponse()
}
