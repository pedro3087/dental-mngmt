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

export async function getPatients(search?: string) {
  const { supabase, profile } = await getAuthenticatedProfile()

  let query = supabase
    .from('patients')
    .select('*')
    .eq('clinic_id', profile.clinic_id)
    .order('full_name', { ascending: true })

  if (search && search.trim()) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching patients:', error.message)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

export async function createPatient(formData: FormData) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const fullName = (formData.get('full_name') as string)?.trim()
  const phone = (formData.get('phone') as string)?.trim() || null
  const email = (formData.get('email') as string)?.trim() || null
  const birthDate = (formData.get('birth_date') as string) || null
  const gender = (formData.get('gender') as string) || null

  if (!fullName) return { success: false, error: 'El nombre es requerido' }

  const { data, error } = await supabase
    .from('patients')
    .insert([{
      clinic_id: profile.clinic_id,
      full_name: fullName,
      phone,
      email,
      birth_date: birthDate || null,
      gender: gender || null,
    }])
    .select('id')
    .single()

  if (error) {
    console.error('Error creating patient:', error.message)
    return { success: false, error: error.message }
  }

  revalidatePath('/pacientes')
  return { success: true, error: null, patientId: data.id }
}

export async function updatePatient(patientId: string, formData: FormData) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { error } = await supabase
    .from('patients')
    .update({
      full_name: (formData.get('full_name') as string)?.trim(),
      phone: (formData.get('phone') as string)?.trim() || null,
      email: (formData.get('email') as string)?.trim() || null,
      birth_date: (formData.get('birth_date') as string) || null,
      gender: (formData.get('gender') as string) || null,
    })
    .eq('id', patientId)
    .eq('clinic_id', profile.clinic_id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/pacientes')
  return { success: true, error: null }
}
