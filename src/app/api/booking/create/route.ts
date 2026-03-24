import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// ─── Rate limiting (in-memory, per IP) ──────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5        // max requests
const RATE_WINDOW_MS = 60_000 // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateMap.get(ip)

  // Lazy cleanup: purge expired entries when map grows large
  if (rateMap.size > 1000) {
    for (const [key, val] of rateMap) {
      if (now > val.resetAt) rateMap.delete(key)
    }
  }

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }

  entry.count++
  return entry.count > RATE_LIMIT
}

// ─── Input validation ───────────────────────────────────────────────────────
const bookingSchema = z.object({
  clinicId:    z.string().uuid(),
  fullName:    z.string().min(2).max(120).trim(),
  phone:       z.string().min(7).max(20).regex(/^[\d\s\-+().]+$/, 'Teléfono inválido'),
  email:       z.string().email().max(254).optional().or(z.literal('')),
  scheduledAt: z.string().datetime(),
  durationMin: z.number().int().min(15).max(480).optional().default(60),
  serviceType: z.string().min(1).max(100),
  notes:       z.string().max(500).nullable().optional(),
})

// ─── Max pending bookings per phone number ──────────────────────────────────
const MAX_PENDING_PER_PHONE = 3

export async function POST(req: NextRequest) {
  // 1. Rate limit by IP
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Intenta en un minuto.' },
      { status: 429 }
    )
  }

  // 2. Parse & validate body
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido' }, { status: 400 })
  }

  const parsed = bookingSchema.safeParse(body)
  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message ?? 'Datos inválidos'
    return NextResponse.json({ error: firstError }, { status: 400 })
  }

  const { clinicId, fullName, phone, email, scheduledAt, durationMin, serviceType, notes } = parsed.data

  // 3. Prevent booking in the past
  if (new Date(scheduledAt) < new Date()) {
    return NextResponse.json({ error: 'No puedes agendar en una fecha pasada.' }, { status: 400 })
  }

  // 4. Limit pending bookings per phone (anti-abuse)
  const { count, error: countError } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true })
    .eq('clinic_id', clinicId)
    .eq('phone', phone)
    .gte('scheduled_at', new Date().toISOString())
    .in('status', ['pending', 'confirmed'])

  if (!countError && (count ?? 0) >= MAX_PENDING_PER_PHONE) {
    return NextResponse.json(
      { error: `Ya tienes ${MAX_PENDING_PER_PHONE} citas pendientes. Cancela una antes de agendar otra.` },
      { status: 409 }
    )
  }

  // 5. Create the booking
  const { data, error } = await supabase.rpc('create_booking', {
    p_clinic_id:    clinicId,
    p_full_name:    fullName,
    p_phone:        phone,
    p_email:        email ?? '',
    p_scheduled_at: scheduledAt,
    p_duration_min: durationMin,
    p_service_type: serviceType,
    p_notes:        notes ?? null,
  })

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
