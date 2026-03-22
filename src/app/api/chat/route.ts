import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'

export const maxDuration = 30

const SYSTEM_PROMPT = `Eres el Copiloto Clínico de VitalDent, un asistente de IA especializado para dentistas y personal clínico.

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
  const { messages, patientContext } = await req.json()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY no configurada' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
  })

  const systemWithContext = patientContext
    ? `${SYSTEM_PROMPT}\n\n## Contexto del Paciente Activo:\n${patientContext}`
    : SYSTEM_PROMPT

  const result = streamText({
    model: openrouter('google/gemini-flash-1.5'),
    system: systemWithContext,
    messages,
    maxOutputTokens: 800,
  })

  return result.toUIMessageStreamResponse()
}
