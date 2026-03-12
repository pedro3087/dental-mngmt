'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getUpcomingAppointments() {
  const supabase = await createClient()

  // Buscamos citas agendadas o confirmadas a partir de ahora, ordenadas por fecha ascendente
  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(*)')
    .in('status', ['scheduled', 'confirmed'])
    .gte('appointment_date', new Date().toISOString())
    .order('appointment_date', { ascending: true })
    .limit(5)

  if (error) {
    console.error('Error fetching appointments:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getDashboardStats() {
  const supabase = await createClient()

  // Calculamos la tasa de ausentismo (no-shows vs total de citas pasadas)
  const { data: allAppointments, error } = await supabase
    .from('appointments')
    .select('status')
  
  if (error) {
    console.error('Error fetching stats:', error.message)
    return { noShowRate: '0.0%', totalAppointments: 0, nextAppointment: null }
  }

  const noShows = allAppointments?.filter(a => a.status === 'no-show').length || 0
  const completed = allAppointments?.filter(a => a.status === 'completed' || a.status === 'no-show').length || 0
  
  const noShowRate = completed > 0 
    ? ((noShows / completed) * 100).toFixed(1) + '%' 
    : '0.0%'

  return {
    noShowRate,
    totalAppointments: allAppointments?.length || 0,
  }
}

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()

  const firstName = formData.get('first_name') as string
  const lastName = formData.get('last_name') as string
  const phone = formData.get('phone') as string
  const appointmentDate = formData.get('appointment_date') as string
  const duration = parseInt(formData.get('duration_minutes') as string || '60')
  const notes = formData.get('notes') as string

  try {
    // 1. Verificar si el paciente ya existe o crearlo.
    // En una v1 podríamos depender del teléfono
    let patientId = null

    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('phone', phone)
      .single()

    if (existingPatient) {
      patientId = existingPatient.id
    } else {
      const { data: newPatient, error: errPatient } = await supabase
        .from('patients')
        .insert([{ first_name: firstName, last_name: lastName, phone }])
        .select('id')
        .single()
      
      if (errPatient) throw errPatient
      patientId = newPatient.id
    }

    // 2. Crear la cita
    const { error: aptError } = await supabase
      .from('appointments')
      .insert([{
        patient_id: patientId,
        appointment_date: new Date(appointmentDate).toISOString(),
        duration_minutes: duration,
        status: 'scheduled',
        whatsapp_status: 'pending',
        notes
      }])

    if (aptError) throw aptError

    // Revalidar rutas para pintar datos nuevos en UI
    revalidatePath('/agenda')
    revalidatePath('/dashboard')

    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error en createAppointment:', error)
    return { success: false, error: error.message || 'Error desconocido' }
  }
}
