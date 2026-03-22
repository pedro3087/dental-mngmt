-- ============================================================
-- Migración 2/7: Extender profiles con role y clinic_id
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS role      TEXT DEFAULT 'receptionist'
    CHECK (role IN ('doctor', 'receptionist', 'admin'));

-- Asignar la clínica demo a todos los profiles sin clínica (entorno de desarrollo)
UPDATE public.profiles
SET clinic_id = (SELECT id FROM public.clinics WHERE slug = 'vitaldent-demo' LIMIT 1),
    role = 'doctor'
WHERE clinic_id IS NULL;

-- Índice para acelerar lookups por clínica
CREATE INDEX IF NOT EXISTS profiles_clinic_id_idx ON public.profiles(clinic_id);
