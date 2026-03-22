import { createOpenAI } from '@ai-sdk/openai'
import { streamText } from 'ai'
import { createClient } from '@/lib/supabase/server'

export const maxDuration = 30

async function getClinicGreeting(clinicId: string | null): Promise<string> {
  if (!clinicId) return '¡Hola! Soy tu asistente dental 😊 ¿En qué te puedo ayudar?'
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('notification_settings')
      .select('chatbot_greeting')
      .eq('clinic_id', clinicId)
      .single()
    return data?.chatbot_greeting || '¡Hola! Soy tu asistente dental 😊 ¿En qué te puedo ayudar?'
  } catch {
    return '¡Hola! Soy tu asistente dental 😊 ¿En qué te puedo ayudar?'
  }
}

export async function POST(req: Request) {
  const { messages, patientName, treatmentTitle, nextAppointment, clinicId, clinicName } = await req.json()

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENROUTER_API_KEY no configurada' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const greeting = await getClinicGreeting(clinicId ?? null)
  const name = clinicName || 'la clínica'

  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey,
  })

  const systemPrompt = `Eres el asistente virtual de ${name}, una clínica dental de confianza.
Estás hablando con ${patientName || 'el paciente'}, quien tiene un tratamiento activo: "${treatmentTitle || 'tratamiento dental'}".
${nextAppointment ? `Su próxima cita es: ${nextAppointment}.` : ''}
Tu mensaje de bienvenida es: "${greeting}"

Tu rol:
- Responder dudas del paciente sobre su tratamiento de forma amable y clara
- Dar recomendaciones generales de cuidado post-consulta
- Informar sobre su próxima cita si se pregunta
- Para emergencias o dolores intensos, siempre indicar llamar a la clínica

Restricciones:
- NO diagnósticos médicos — siempre derivar al dentista para diagnósticos
- NO cambiar citas directamente — decir que llamen a recepción
- Responde en español, de forma cálida y empática, en máximo 3 oraciones`

  const result = streamText({
    model: openrouter('google/gemini-flash-1.5'),
    system: systemPrompt,
    messages,
    maxOutputTokens: 400,
  })

  return result.toUIMessageStreamResponse()
}
