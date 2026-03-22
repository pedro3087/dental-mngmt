-- ============================================================
-- Migración 6/7: Tabla inventory (insumos clínicos)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.inventory (
  id                UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id         UUID         NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  name              TEXT         NOT NULL,
  sku               TEXT,
  category          TEXT,
  unit              TEXT         DEFAULT 'pieza',
  quantity_current  INT          DEFAULT 0,
  quantity_min      INT          DEFAULT 5,       -- Umbral para alerta de bajo stock
  unit_cost         NUMERIC(10,2),
  expiry_date       DATE,
  supplier          TEXT,
  notes             TEXT,
  created_at        TIMESTAMPTZ  DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS inventory_clinic_id_idx ON public.inventory(clinic_id);

-- Datos semilla de desarrollo
INSERT INTO public.inventory (clinic_id, name, sku, category, unit, quantity_current, quantity_min, unit_cost)
SELECT
  c.id,
  item.name,
  item.sku,
  item.category,
  item.unit,
  item.quantity_current,
  item.quantity_min,
  item.unit_cost
FROM public.clinics c,
(VALUES
  ('Guantes de nitrilo (caja)', 'GLOV-NIT-M', 'PPE', 'caja', 8, 3, 180.00),
  ('Mascarillas quirúrgicas (caja)', 'MASK-QX-50', 'PPE', 'caja', 5, 2, 120.00),
  ('Composite A2 (jeringa)', 'COMP-A2-4G', 'Resinas', 'pieza', 3, 2, 450.00),
  ('Anestesia Lidocaína 2% (caja)', 'ANES-LID-50', 'Anestesia', 'caja', 2, 3, 350.00),
  ('Brackets metálicos (kit)', 'BRKT-MTL-20', 'Ortodoncia', 'kit', 10, 4, 280.00)
) AS item(name, sku, category, unit, quantity_current, quantity_min, unit_cost)
WHERE c.slug = 'vitaldent-demo'
ON CONFLICT DO NOTHING;
