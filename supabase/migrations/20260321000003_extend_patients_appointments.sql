-- ============================================================
-- Migración 3/7: Extender patients y appointments con clinic_id
-- ============================================================

-- === PATIENTS ===
ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS clinic_id  UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS gender     TEXT CHECK (gender IN ('M', 'F', 'otro')),
  ADD COLUMN IF NOT EXISTS rfc        TEXT,
  ADD COLUMN IF NOT EXISTS cfdi_use   TEXT DEFAULT 'G03',
  ADD COLUMN IF NOT EXISTS anamnesis  JSONB DEFAULT '{}';

-- Asignar clínica demo a todos los pacientes existentes sin clínica
UPDATE public.patients
SET clinic_id = (SELECT id FROM public.clinics WHERE slug = 'vitaldent-demo' LIMIT 1)
WHERE clinic_id IS NULL;

CREATE INDEX IF NOT EXISTS patients_clinic_id_idx ON public.patients(clinic_id);

-- === APPOINTMENTS ===
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS clinic_id    UUID REFERENCES public.clinics(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS service_type TEXT,
  ADD COLUMN IF NOT EXISTS amount_mxn   NUMERIC(10,2);

-- Asignar clínica demo a todas las citas existentes sin clínica
UPDATE public.appointments
SET clinic_id = (SELECT id FROM public.clinics WHERE slug = 'vitaldent-demo' LIMIT 1)
WHERE clinic_id IS NULL;

CREATE INDEX IF NOT EXISTS appointments_clinic_id_idx ON public.appointments(clinic_id);
