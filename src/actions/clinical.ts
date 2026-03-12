'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getPatientTreatmentJourneys(patientId: string) {
  const supabase = await createClient()

  // 1. Fetch journeys first
  const { data: journeys, error } = await supabase
    .from('treatment_journeys')
    .select('*')
    .eq('patient_id', patientId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching treatment journeys:', error.message, error.details, error.hint)
    return []
  }



  // 2. Si existen journeys, buscamos sus milestones a mano (evita timeouts de joins)
  const journeyIds = journeys.map(j => j.id)
  
  if (journeyIds.length > 0) {
    const { data: milestones } = await supabase
      .from('treatment_milestones')
      .select('*')
      .in('journey_id', journeyIds)
      .order('order_index', { ascending: true })

    // Mapeamos los milestones a su respectivo journey
    const journeysWithMilestones = journeys.map(journey => ({
      ...journey,
      treatment_milestones: milestones?.filter(m => m.journey_id === journey.id) || []
    }))

    return journeysWithMilestones
  }

  return journeys
}

export async function updateMilestoneStatus(milestoneId: string, newStatus: 'pending' | 'current' | 'completed') {
  const supabase = await createClient()

  const { error } = await supabase
    .from('treatment_milestones')
    .update({ status: newStatus })
    .eq('id', milestoneId)

  if (error) {
    console.error('Error updating milestone:', error)
    return false
  }

  revalidatePath('/clinical')
  revalidatePath('/portal/[id]', 'page')
  return true
}

export async function updateJourneyProgress(journeyId: string, progress: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('treatment_journeys')
    .update({ progress_percentage: progress })
    .eq('id', journeyId)

  if (error) {
    console.error('Error updating progress:', error)
    return false
  }

  revalidatePath('/clinical')
  revalidatePath('/portal/[id]', 'page')
  return true
}

export async function createNewTreatmentJourney(patientId: string, title: string) {
  const supabase = await createClient()

  const { data: journey, error } = await supabase
    .from('treatment_journeys')
    .insert({ patient_id: patientId, title, progress_percentage: 0 })
    .select()
    .single()

  if (error || !journey) {
    console.error('Error creating journey:', error)
    return null
  }

  // Add default first milestone
  await supabase.from('treatment_milestones').insert({
    journey_id: journey.id,
    title: 'Evaluación y Diagnóstico Inicial',
    status: 'pending',
    order_index: 1
  })

  revalidatePath('/clinical')
  return journey
}

export async function createMilestone(journeyId: string, title: string, orderIndex: number) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('treatment_milestones')
    .insert({ journey_id: journeyId, title, order_index: orderIndex, status: 'pending' })

  if (error) {
    console.error('Error creating milestone:', error)
    return false
  }

  revalidatePath('/clinical')
  return true
}

export async function getJourneyByShareToken(token: string) {
   const supabase = await createClient()
   
   const { data, error } = await supabase
     .from('treatment_journeys')
     .select(`
       *,
       patients (first_name, last_name),
       treatment_milestones (*)
     `)
     .eq('share_token', token)
     .single()
     
   if (error || !data) return null
   
   // Sort milestones
   if (data.treatment_milestones) {
      // @ts-ignore
      data.treatment_milestones.sort((a,b) => a.order_index - b.order_index)
   }
   
   return data
}
