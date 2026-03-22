'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface BookingService {
  id: string
  clinic_id: string
  label: string
  emoji: string
  duration_min: number
  description: string | null
  tag: string | null
  accent: string
  active: boolean
  order_index: number
}

export interface BookingSettings {
  id: string
  clinic_id: string
  open_days: number[]
  start_hour: number
  end_hour: number
  slot_interval: number
  booking_active: boolean
}

async function getClinicId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('profiles')
    .select('clinic_id, role')
    .eq('id', user.id)
    .single()
  return data
}

export async function getBookingConfig() {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { services: [], settings: null, clinicId: null }

  const [servicesRes, settingsRes] = await Promise.all([
    supabase
      .from('booking_services')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .order('order_index'),
    supabase
      .from('booking_settings')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .single(),
  ])

  return {
    services:  (servicesRes.data ?? []) as BookingService[],
    settings:  settingsRes.data as BookingSettings | null,
    clinicId:  profile.clinic_id as string,
    role:      profile.role as string,
  }
}

export async function updateBookingSchedule(data: {
  openDays: number[]
  startHour: number
  endHour: number
  slotInterval: number
  bookingActive: boolean
}) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('booking_settings')
    .upsert({
      clinic_id:      profile.clinic_id,
      open_days:      data.openDays,
      start_hour:     data.startHour,
      end_hour:       data.endHour,
      slot_interval:  data.slotInterval,
      booking_active: data.bookingActive,
      updated_at:     new Date().toISOString(),
    }, { onConflict: 'clinic_id' })

  if (error) return { error: error.message }
  revalidatePath('/settings')
  revalidatePath('/book')
  return { success: true }
}

export async function upsertBookingService(service: {
  id?: string
  label: string
  emoji: string
  durationMin: number
  description: string
  tag?: string
  accent: string
  active: boolean
  orderIndex: number
}) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }

  const payload = {
    clinic_id:    profile.clinic_id,
    label:        service.label,
    emoji:        service.emoji,
    duration_min: service.durationMin,
    description:  service.description,
    tag:          service.tag || null,
    accent:       service.accent,
    active:       service.active,
    order_index:  service.orderIndex,
    updated_at:   new Date().toISOString(),
  }

  if (service.id) {
    const { error } = await supabase
      .from('booking_services')
      .update(payload)
      .eq('id', service.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase
      .from('booking_services')
      .insert(payload)
    if (error) return { error: error.message }
  }

  revalidatePath('/settings')
  revalidatePath('/book')
  return { success: true }
}

export async function toggleBookingService(serviceId: string, active: boolean) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('booking_services')
    .update({ active, updated_at: new Date().toISOString() })
    .eq('id', serviceId)

  if (error) return { error: error.message }
  revalidatePath('/settings')
  revalidatePath('/book')
  return { success: true }
}

export async function deleteBookingService(serviceId: string) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('booking_services')
    .delete()
    .eq('id', serviceId)

  if (error) return { error: error.message }
  revalidatePath('/settings')
  revalidatePath('/book')
  return { success: true }
}
