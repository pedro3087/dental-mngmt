'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ClinicProfile {
  id: string
  name: string
  phone: string | null
  address: string | null
  rfc: string | null
  logo_url: string | null
  primary_color: string | null
}

export interface BillingSettings {
  clinic_id: string
  tax_rate: number
  payment_method: string
  payment_form: string
  cfdi_use_default: string
}

export interface PacCredentials {
  provider: string
  username: string
  password: string
  sandbox: boolean
}

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

// ─── Clinic Profile ───────────────────────────────────────────────────────────

export async function getClinicProfile() {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return null

  const { data } = await supabase
    .from('clinics')
    .select('id, name, phone, address, rfc, logo_url, primary_color')
    .eq('id', profile.clinic_id)
    .single()

  return data as ClinicProfile | null
}

export async function updateClinicProfile(data: {
  name: string
  phone: string
  address: string
  rfc: string
  logo_url: string
  primary_color: string
}) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }
  if (profile.role !== 'admin') return { error: 'Solo administradores pueden editar el perfil' }

  const { error } = await supabase
    .from('clinics')
    .update({
      name:          data.name,
      phone:         data.phone || null,
      address:       data.address || null,
      rfc:           data.rfc || null,
      logo_url:      data.logo_url || null,
      primary_color: data.primary_color || null,
      updated_at:    new Date().toISOString(),
    })
    .eq('id', profile.clinic_id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

// ─── Billing Settings ─────────────────────────────────────────────────────────

export async function getBillingConfig() {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { billing: null, pac: null }

  const [billingRes, clinicRes] = await Promise.all([
    supabase
      .from('billing_settings')
      .select('*')
      .eq('clinic_id', profile.clinic_id)
      .single(),
    supabase
      .from('clinics')
      .select('pac_credentials')
      .eq('id', profile.clinic_id)
      .single(),
  ])

  return {
    billing: billingRes.data as BillingSettings | null,
    pac:     (clinicRes.data?.pac_credentials ?? null) as PacCredentials | null,
  }
}

export async function updateBillingSettings(data: {
  taxRate: number
  paymentMethod: string
  paymentForm: string
  cfdiUseDefault: string
}) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('billing_settings')
    .upsert({
      clinic_id:        profile.clinic_id,
      tax_rate:         data.taxRate,
      payment_method:   data.paymentMethod,
      payment_form:     data.paymentForm,
      cfdi_use_default: data.cfdiUseDefault,
      updated_at:       new Date().toISOString(),
    }, { onConflict: 'clinic_id' })

  if (error) return { error: error.message }
  revalidatePath('/settings')
  revalidatePath('/billing')
  return { success: true }
}

export async function updatePacCredentials(data: {
  provider: string
  username: string
  password: string
  sandbox: boolean
}) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }
  if (profile.role !== 'admin') return { error: 'Solo administradores pueden configurar el PAC' }

  const { error } = await supabase
    .from('clinics')
    .update({
      pac_credentials: {
        provider: data.provider,
        username: data.username,
        password: data.password,
        sandbox:  data.sandbox,
      },
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.clinic_id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}
