'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
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

// ─── Team Management ─────────────────────────────────────────────────────────

export interface TeamMember {
  id: string
  email: string
  full_name: string | null
  role: string
  active: boolean
  created_at: string
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const profile = await getClinicId()
  if (!profile?.clinic_id) return []

  const supabase = await createClient()

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, role, active, created_at')
    .eq('clinic_id', profile.clinic_id)

  if (!profiles) return []

  // Fetch emails via admin client only if service role key is available
  let emailMap = new Map<string, string>()
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const admin = createAdminClient()
      const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
      emailMap = new Map((data?.users ?? []).map(u => [u.id, u.email ?? '']))
    } catch {
      // Admin API unavailable — emails will be empty
    }
  }

  return profiles.map(p => ({
    id:         p.id,
    email:      emailMap.get(p.id) ?? '',
    full_name:  p.full_name,
    role:       p.role,
    active:     p.active,
    created_at: p.created_at,
  }))
}

export async function updateMemberRole(userId: string, role: string) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }
  if (profile.role !== 'admin') return { error: 'Solo administradores pueden cambiar roles' }

  const { error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .eq('clinic_id', profile.clinic_id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function deactivateMember(userId: string) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }
  if (profile.role !== 'admin') return { error: 'Solo administradores pueden desactivar usuarios' }

  const { data: { user } } = await (await createClient()).auth.getUser()
  if (user?.id === userId) return { error: 'No puedes desactivarte a ti mismo' }

  const { error } = await supabase
    .from('profiles')
    .update({ active: false, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .eq('clinic_id', profile.clinic_id)

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

export async function inviteTeamMember(email: string, role: string) {
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }
  if (profile.role !== 'admin') return { error: 'Solo administradores pueden invitar usuarios' }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { clinic_id: profile.clinic_id, role },
  })

  if (error) return { error: error.message }

  // Crear perfil inmediatamente para que aparezca en la lista
  if (data.user) {
    await admin
      .from('profiles')
      .upsert({
        id:         data.user.id,
        clinic_id:  profile.clinic_id,
        role,
        active:     true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' })
  }

  revalidatePath('/settings')
  return { success: true }
}

// ─── Notification Settings ────────────────────────────────────────────────────

export interface NotificationSettings {
  clinic_id:        string
  wa_enabled:       boolean
  email_enabled:    boolean
  reminder_hours_1: number
  reminder_hours_2: number
  reminder_template: string | null
  chatbot_greeting:  string | null
}

export async function getNotificationSettings() {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return null

  const { data } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('clinic_id', profile.clinic_id)
    .single()

  return data as NotificationSettings | null
}

export async function updateNotificationSettings(data: {
  waEnabled:        boolean
  emailEnabled:     boolean
  reminderHours1:   number
  reminderHours2:   number
  reminderTemplate: string
  chatbotGreeting:  string
}) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('notification_settings')
    .upsert({
      clinic_id:         profile.clinic_id,
      wa_enabled:        data.waEnabled,
      email_enabled:     data.emailEnabled,
      reminder_hours_1:  data.reminderHours1,
      reminder_hours_2:  data.reminderHours2,
      reminder_template: data.reminderTemplate || null,
      chatbot_greeting:  data.chatbotGreeting || null,
      updated_at:        new Date().toISOString(),
    }, { onConflict: 'clinic_id' })

  if (error) return { error: error.message }
  revalidatePath('/settings')
  return { success: true }
}

// ─── Inventory Settings ───────────────────────────────────────────────────────

export interface InventorySettings {
  clinic_id:            string
  default_min_quantity: number
  alerts_enabled:       boolean
  categories:           string[]
  units:                string[]
  alert_email:          string | null
}

export async function getInventorySettings() {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return null

  const { data } = await supabase
    .from('inventory_settings')
    .select('*')
    .eq('clinic_id', profile.clinic_id)
    .single()

  return data as InventorySettings | null
}

export async function updateInventorySettings(data: {
  defaultMinQuantity: number
  alertsEnabled:      boolean
  categories:         string[]
  units:              string[]
  alertEmail:         string
}) {
  const supabase = await createClient()
  const profile = await getClinicId()
  if (!profile?.clinic_id) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('inventory_settings')
    .upsert({
      clinic_id:            profile.clinic_id,
      default_min_quantity: data.defaultMinQuantity,
      alerts_enabled:       data.alertsEnabled,
      categories:           data.categories,
      units:                data.units,
      alert_email:          data.alertEmail || null,
      updated_at:           new Date().toISOString(),
    }, { onConflict: 'clinic_id' })

  if (error) return { error: error.message }
  revalidatePath('/settings')
  revalidatePath('/inventory')
  return { success: true }
}
