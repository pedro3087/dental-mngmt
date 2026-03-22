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
// MÉTRICAS
// ============================================================

export async function getBillingStats() {
  const { supabase, profile } = await getAuthenticatedProfile()

  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const [{ data: monthInvoices }, { data: pendingInvoices }, { count: issuedCount }] = await Promise.all([
    supabase
      .from('invoices')
      .select('amount_total')
      .eq('clinic_id', profile.clinic_id)
      .eq('status', 'paid')
      .gte('issued_at', startOfMonth.toISOString()),
    supabase
      .from('invoices')
      .select('amount_total')
      .eq('clinic_id', profile.clinic_id)
      .in('status', ['draft', 'issued']),
    supabase
      .from('invoices')
      .select('id', { count: 'exact', head: true })
      .eq('clinic_id', profile.clinic_id)
      .eq('status', 'issued'),
  ])

  const ingresosMes = monthInvoices?.reduce((acc, inv) => acc + (inv.amount_total ?? 0), 0) ?? 0
  const porCobrar = pendingInvoices?.reduce((acc, inv) => acc + (inv.amount_total ?? 0), 0) ?? 0

  return {
    ingresosMes,
    porCobrar,
    facturasTimbradas: issuedCount ?? 0,
  }
}

// ============================================================
// FACTURAS
// ============================================================

export async function getInvoices(limit = 50) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { data, error } = await supabase
    .from('invoices')
    .select('*, patients(id, full_name, phone, rfc)')
    .eq('clinic_id', profile.clinic_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function createInvoice(formData: FormData) {
  const { supabase, profile } = await getAuthenticatedProfile()

  const patientId = formData.get('patient_id') as string
  const concept = formData.get('concept') as string
  const amountSubtotal = parseFloat(formData.get('amount_subtotal') as string || '0')
  const taxRate = parseFloat(formData.get('tax_rate') as string || '0') / 100
  const amountTax = parseFloat((amountSubtotal * taxRate).toFixed(2))
  const amountTotal = parseFloat((amountSubtotal + amountTax).toFixed(2))
  const paymentMethod = (formData.get('payment_method') as string) || 'PUE'
  const paymentForm = (formData.get('payment_form') as string) || '01'
  const cfdiUse = (formData.get('cfdi_use') as string) || 'G03'
  const appointmentId = (formData.get('appointment_id') as string) || null

  if (!patientId) return { success: false, error: 'Paciente requerido' }
  if (amountSubtotal <= 0) return { success: false, error: 'Monto inválido' }

  // Generar folio secuencial
  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('clinic_id', profile.clinic_id)

  const folio = `VD-${String((count ?? 0) + 1).padStart(4, '0')}`

  const { data: invoice, error } = await supabase
    .from('invoices')
    .insert({
      patient_id: patientId,
      clinic_id: profile.clinic_id,
      appointment_id: appointmentId,
      folio,
      amount_subtotal: amountSubtotal,
      amount_tax: amountTax,
      amount_total: amountTotal,
      payment_method: paymentMethod,
      payment_form: paymentForm,
      cfdi_use: cfdiUse,
      status: 'draft',
      // El concepto va como nota en el folio (PAC real lo recibe en XML)
    })
    .select('id, folio')
    .single()

  if (error) return { success: false, error: error.message }

  // Simular timbrado PAC (en producción: llamar a Facturapi / SW Sapien)
  // Por ahora marcamos como 'issued' directamente para V1
  await supabase
    .from('invoices')
    .update({
      status: 'issued',
      uuid_fiscal: `SIM-${crypto.randomUUID().split('-')[0].toUpperCase()}`,
      issued_at: new Date().toISOString(),
    })
    .eq('id', invoice.id)

  revalidatePath('/billing')
  return { success: true, error: null, folio: invoice.folio }
}

export async function updateInvoiceStatus(invoiceId: string, status: 'paid' | 'cancelled') {
  const { supabase, profile } = await getAuthenticatedProfile()

  const { error } = await supabase
    .from('invoices')
    .update({ status })
    .eq('id', invoiceId)
    .eq('clinic_id', profile.clinic_id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/billing')
  return { success: true }
}
