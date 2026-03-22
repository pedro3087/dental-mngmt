-- ============================================================
-- Migración 7/7: Extender treatment_journeys con clinic_id
-- ============================================================

ALTER TABLE public.treatment_journeys
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;

-- CRÍTICO: Migrar datos existentes antes de aplicar RLS estricto
-- (sin esto, los registros existentes sin clinic_id quedarían sin acceso)
UPDATE public.treatment_journeys
SET clinic_id = (SELECT id FROM public.clinics WHERE slug = 'vitaldent-demo' LIMIT 1)
WHERE clinic_id IS NULL;

ALTER TABLE public.treatment_milestones
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES public.clinics(id) ON DELETE CASCADE;

-- Propagar clinic_id desde el journey padre
UPDATE public.treatment_milestones tm
SET clinic_id = tj.clinic_id
FROM public.treatment_journeys tj
WHERE tm.journey_id = tj.id
  AND tm.clinic_id IS NULL;

CREATE INDEX IF NOT EXISTS treatment_journeys_clinic_id_idx   ON public.treatment_journeys(clinic_id);
CREATE INDEX IF NOT EXISTS treatment_milestones_clinic_id_idx ON public.treatment_milestones(clinic_id);
