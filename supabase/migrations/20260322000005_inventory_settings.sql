-- Inventory global settings per clinic (stock alerts, categories, units)
CREATE TABLE IF NOT EXISTS public.inventory_settings (
  clinic_id            UUID        PRIMARY KEY REFERENCES public.clinics(id) ON DELETE CASCADE,
  default_min_quantity INT         NOT NULL DEFAULT 3,
  alerts_enabled       BOOLEAN     NOT NULL DEFAULT true,
  categories           TEXT[]      NOT NULL DEFAULT ARRAY['PPE','Resinas','Anestesia','Ortodoncia'],
  units                TEXT[]      NOT NULL DEFAULT ARRAY['pieza','caja','frasco','cartucho','kit'],
  alert_email          TEXT,
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.inventory_settings ENABLE ROW LEVEL SECURITY;

-- Clinic staff can read/write their own clinic settings
CREATE POLICY "inventory_settings_clinic_isolation" ON public.inventory_settings
  FOR ALL
  USING  (clinic_id = public.get_user_clinic_id())
  WITH CHECK (clinic_id = public.get_user_clinic_id());

-- Seed default for VitalDent
INSERT INTO public.inventory_settings (clinic_id)
VALUES ('e94a8c0d-174c-44b2-89c3-8d52483f15d3')
ON CONFLICT (clinic_id) DO NOTHING;
