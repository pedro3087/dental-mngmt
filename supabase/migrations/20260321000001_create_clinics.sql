-- ============================================================
-- Migración 1/7: Tabla clinics (base de toda la multiclínica)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.clinics (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name             TEXT        NOT NULL,
  slug             TEXT        UNIQUE NOT NULL,
  phone            TEXT,
  address          TEXT,
  rfc              TEXT,
  pac_credentials  JSONB,                          -- Llaves PAC para CFDI 4.0 (nunca exponer en cliente)
  logo_url         TEXT,
  primary_color    TEXT        DEFAULT '#2563eb',
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Clínica semilla para desarrollo
INSERT INTO public.clinics (name, slug, phone, address)
VALUES ('VitalDent Demo', 'vitaldent-demo', '+52 55 1234 5678', 'Ciudad de México, CDMX')
ON CONFLICT (slug) DO NOTHING;
