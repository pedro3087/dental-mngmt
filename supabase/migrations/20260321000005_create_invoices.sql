-- ============================================================
-- Migración 5/7: Tabla invoices (CFDI 4.0)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.invoices (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id       UUID         NOT NULL REFERENCES public.patients(id),
  clinic_id        UUID         NOT NULL REFERENCES public.clinics(id),
  appointment_id   UUID         REFERENCES public.appointments(id),
  folio            TEXT,                           -- Folio interno de la clínica
  uuid_fiscal      TEXT,                           -- UUID del CFDI emitido por el PAC
  amount_subtotal  NUMERIC(10,2) NOT NULL,
  amount_tax       NUMERIC(10,2) DEFAULT 0,
  amount_total     NUMERIC(10,2) NOT NULL,
  payment_method   TEXT         DEFAULT 'PUE',     -- PUE (Pago en Una Exhibición) o PPD
  payment_form     TEXT         DEFAULT '01',      -- Catálogo SAT c_FormaPago
  cfdi_use         TEXT         DEFAULT 'G03',     -- Gastos en general
  status           TEXT         DEFAULT 'draft'
    CHECK (status IN ('draft', 'issued', 'cancelled', 'paid')),
  xml_url          TEXT,                           -- URL en Supabase Storage
  pdf_url          TEXT,
  issued_at        TIMESTAMPTZ,
  created_at       TIMESTAMPTZ  DEFAULT NOW(),
  updated_at       TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS invoices_clinic_id_idx   ON public.invoices(clinic_id);
CREATE INDEX IF NOT EXISTS invoices_patient_id_idx  ON public.invoices(patient_id);
CREATE INDEX IF NOT EXISTS invoices_status_idx      ON public.invoices(status);
