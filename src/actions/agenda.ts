'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthenticatedProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, clinic_id, role')
    .eq('id', user.id)
    .single()

  if (!profile?.clinic_id) throw new Error('Perfil sin clínica asignada')
  return { supabase, profile }
}

// ============================================================
// CITAS
// ============================================================

export async function fetchAppointmentsByDate(date: string): Promise<import('@/types/database').Appointment[]> {
  const { createClient } = await import('@/lib/supabase/server')
  const supabase = await createClient()

  const startOfDay = `${date}T00:00:00.000Z`
  const endOfDay = `${date}T23:59:59.999Z`

  const { data } = await supabase
    .from('appointments')
    .select('*, patients(id, full_name, phone, email)')
    .gte('scheduled_at', startOfDay)
    .lte('scheduled_at', endOfDay)
    .order('scheduled_at', { ascending: true })

  return data ?? []
}

export async function getAppointmentsByDate(date: string) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(id, full_name, phone, email)')
    .eq('clinic_id', profile.clinic_id)
    .gte('scheduled_at', startOfDay.toISOString())
    .lte('scheduled_at', endOfDay.toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Error fetching appointments:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function getUpcomingAppointments() {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { data, error } = await supabase
    .from('appointments')
    .select('*, patients(id, full_name, phone, email)')
    .eq('clinic_id', profile.clinic_id)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(20)

  if (error) {
    console.error('Error fetching appointments:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createAppointment(formData: FormData) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const existingPatientId = formData.get('patient_id') as string | null
  const fullName = formData.get('full_name') as string
  const phone = formData.get('phone') as string
  const scheduledAt = formData.get('scheduled_at') as string
  const durationMin = parseInt(formData.get('duration_min') as string || '60')
  const serviceType = formData.get('service_type') as string
  const notes = formData.get('notes') as string

  try {
    // 1. Usar paciente existente si fue seleccionado desde el buscador
    let patientId: string | null = existingPatientId || null

    if (!patientId) {
      // Buscar por teléfono o crear nuevo
      const { data: found } = await supabase
        .from('patients')
        .select('id')
        .eq('phone', phone)
        .eq('clinic_id', profile.clinic_id)
        .single()

      if (found) {
        patientId = found.id
      } else {
        const { data: newPatient, error: errPatient } = await supabase
          .from('patients')
          .insert([{ full_name: fullName, phone, clinic_id: profile.clinic_id }])
          .select('id')
          .single()

        if (errPatient) throw errPatient
        patientId = newPatient.id
      }
    }

    // 2. Crear la cita
    const { error: aptError } = await supabase
      .from('appointments')
      .insert([{
        patient_id: patientId,
        clinic_id: profile.clinic_id,
        doctor_id: profile.id,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_min: durationMin,
        status: 'scheduled',
        service_type: serviceType || null,
        notes: notes || null,
      }])

    if (aptError) throw aptError

    revalidatePath('/agenda')
    revalidatePath('/dashboard')

    return { success: true, error: null }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Error en createAppointment:', error)
    return { success: false, error: msg }
  }
}

export async function updateAppointmentStatus(appointmentId: string, status: string) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .eq('clinic_id', profile.clinic_id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/agenda')
  return { success: true, error: null }
}

export async function getDashboardStats() {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { data: allAppointments, error } = await supabase
    .from('appointments')
    .select('status')
    .eq('clinic_id', profile.clinic_id)

  if (error) return { noShowRate: '0.0%', totalAppointments: 0 }

  const noShows = allAppointments?.filter(a => a.status === 'no_show').length || 0
  const completed = allAppointments?.filter(a => a.status === 'completed' || a.status === 'no_show').length || 0

  return {
    noShowRate: completed > 0 ? ((noShows / completed) * 100).toFixed(1) + '%' : '0.0%',
    totalAppointments: allAppointments?.length || 0,
  }
}
