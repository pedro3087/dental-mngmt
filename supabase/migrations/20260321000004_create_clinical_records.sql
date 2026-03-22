-- ============================================================
-- Migración 4/7: Tabla clinical_records (expediente NOM-013)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clinical_records (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      UUID        NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id       UUID        NOT NULL REFERENCES public.profiles(id),
  clinic_id       UUID        NOT NULL REFERENCES public.clinics(id),
  appointment_id  UUID        REFERENCES public.appointments(id),
  odontogram      JSONB       DEFAULT '{}',     -- Estado diente 1-32: { "1": { status, notes } }
  diagnosis       TEXT,
  treatment_plan  TEXT,
  notes           TEXT,
  image_urls      TEXT[]      DEFAULT '{}',     -- Storage URLs de fotos/radiografías
  prescription    JSONB       DEFAULT '{}',     -- Receta estructurada
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS clinical_records_patient_id_idx    ON public.clinical_records(patient_id);
CREATE INDEX IF NOT EXISTS clinical_records_clinic_id_idx     ON public.clinical_records(clinic_id);
CREATE INDEX IF NOT EXISTS clinical_records_appointment_id_idx ON public.clinical_records(appointment_id);
