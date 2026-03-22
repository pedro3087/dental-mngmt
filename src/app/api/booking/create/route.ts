import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { clinicId, fullName, phone, email, scheduledAt, durationMin, serviceType, notes } = body

  if (!clinicId || !fullName || !phone || !scheduledAt) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase.rpc('create_booking', {
    p_clinic_id:    clinicId,
    p_full_name:    fullName,
    p_phone:        phone,
    p_email:        email ?? '',
    p_scheduled_at: scheduledAt,
    p_duration_min: durationMin ?? 60,
    p_service_type: serviceType,
    p_notes:        notes ?? null,
  })

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
