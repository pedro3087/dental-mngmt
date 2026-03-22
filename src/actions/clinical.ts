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
// CLINICAL RECORDS
// ============================================================

export async function getClinicalRecord(patientId: string) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { data, error } = await supabase
    .from('clinical_records')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', profile.clinic_id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) return null
  return data
}

export async function saveOdontogram(patientId: string, odontogram: Record<string, unknown>) {
  const { supabase, profile } = await getAuthenticatedProfile()

  // Upsert: actualiza el registro más reciente o crea uno nuevo
  const existing = await getClinicalRecord(patientId)

  if (existing) {
    const { error } = await supabase
      .from('clinical_records')
      .update({ odontogram, updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from('clinical_records')
      .insert({
        patient_id: patientId,
        doctor_id: profile.id,
        clinic_id: profile.clinic_id,
        odontogram,
      })

    if (error) return { success: false, error: error.message }
  }

  revalidatePath(`/clinical/${patientId}`)
  return { success: true }
}

export async function saveNotes(patientId: string, notes: string, diagnosis: string, treatmentPlan: string) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const existing = await getClinicalRecord(patientId)

  if (existing) {
    const { error } = await supabase
      .from('clinical_records')
      .update({ notes, diagnosis, treatment_plan: treatmentPlan, updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from('clinical_records')
      .insert({
        patient_id: patientId,
        doctor_id: profile.id,
        clinic_id: profile.clinic_id,
        notes,
        diagnosis,
        treatment_plan: treatmentPlan,
      })

    if (error) return { success: false, error: error.message }
  }

  revalidatePath(`/clinical/${patientId}`)
  return { success: true }
}

export async function saveAnamnesis(patientId: string, anamnesis: Record<string, unknown>) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { error } = await supabase
    .from('patients')
    .update({ anamnesis })
    .eq('id', patientId)
    .eq('clinic_id', profile.clinic_id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/clinical/${patientId}`)
  return { success: true }
}

// ============================================================
// TREATMENT JOURNEYS
// ============================================================

export async function getPatientTreatmentJourneys(patientId: string) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { data: journeys, error } = await supabase
    .from('treatment_journeys')
    .select('*')
    .eq('patient_id', patientId)
    .eq('clinic_id', profile.clinic_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching treatment journeys:', error.message)
    return []
  }

  if (journeys.length > 0) {
    const journeyIds = journeys.map(j => j.id)
    const { data: milestones } = await supabase
      .from('treatment_milestones')
      .select('*')
      .in('journey_id', journeyIds)
      .order('order_index', { ascending: true })

    return journeys.map(journey => ({
      ...journey,
      treatment_milestones: milestones?.filter(m => m.journey_id === journey.id) || [],
    }))
  }

  return journeys
}

export async function updateMilestoneStatus(milestoneId: string, newStatus: 'pending' | 'current' | 'completed') {
  const { supabase } = await getAuthenticatedProfile()

  const { error } = await supabase
    .from('treatment_milestones')
    .update({ status: newStatus })
    .eq('id', milestoneId)

  if (error) return false
  revalidatePath('/clinical')
  revalidatePath('/portal/[id]', 'page')
  return true
}

export async function updateJourneyProgress(journeyId: string, progress: number) {
  const { supabase } = await getAuthenticatedProfile()

  const { error } = await supabase
    .from('treatment_journeys')
    .update({ progress_percentage: progress })
    .eq('id', journeyId)

  if (error) return false
  revalidatePath('/clinical')
  revalidatePath('/portal/[id]', 'page')
  return true
}

export async function createNewTreatmentJourney(patientId: string, title: string) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { data: journey, error } = await supabase
    .from('treatment_journeys')
    .insert({ patient_id: patientId, clinic_id: profile.clinic_id, title, progress_percentage: 0 })
    .select()
    .single()

  if (error || !journey) return null

  await supabase.from('treatment_milestones').insert({
    journey_id: journey.id,
    clinic_id: profile.clinic_id,
    title: 'Evaluación y Diagnóstico Inicial',
    status: 'pending',
    order_index: 1,
  })

  revalidatePath('/clinical')
  return journey
}

export async function createMilestone(journeyId: string, title: string, orderIndex: number) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { error } = await supabase
    .from('treatment_milestones')
    .insert({ journey_id: journeyId, clinic_id: profile.clinic_id, title, order_index: orderIndex, status: 'pending' })

  if (error) return false
  revalidatePath('/clinical')
  return true
}

export async function getJourneyByShareToken(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('treatment_journeys')
    .select(`*, patients(full_name), treatment_milestones(*)`)
    .eq('share_token', token)
    .single()

  if (error || !data) return null

  if (data.treatment_milestones && Array.isArray(data.treatment_milestones)) {
    data.treatment_milestones.sort(
      (a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index
    )
  }

  return data
}
