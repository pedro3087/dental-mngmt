-- ============================================================
-- Migración: Funciones helper + RLS policies por clinic_id
-- ============================================================

-- === FUNCIONES HELPER (SECURITY DEFINER) ===
-- Se ejecutan con privilegios del owner, evitando la necesidad de JWT custom claims.
-- Trade-off documentado: 1 query extra a profiles por request protegido (aceptable en V1).

CREATE OR REPLACE FUNCTION public.get_user_clinic_id()
RETURNS UUID LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT clinic_id FROM public.profiles WHERE id = auth.uid() LIMIT 1
$$;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1
$$;


-- ============================================================
-- CLINICS — Solo admin puede ver su propia clínica
-- ============================================================
ALTER TABLE public.clinics ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clinic_self_access" ON public.clinics;
CREATE POLICY "clinic_self_access" ON public.clinics
  FOR SELECT USING (id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "clinic_admin_update" ON public.clinics;
CREATE POLICY "clinic_admin_update" ON public.clinics
  FOR UPDATE USING (
    id = public.get_user_clinic_id()
    AND public.get_user_role() = 'admin'
  );


-- ============================================================
-- PROFILES — Cada usuario ve solo perfiles de su clínica
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_clinic_isolation" ON public.profiles;
CREATE POLICY "profiles_clinic_isolation" ON public.profiles
  FOR ALL USING (clinic_id = public.get_user_clinic_id());

-- Permitir a cada usuario leer su propio perfil (necesario para login)
DROP POLICY IF EXISTS "profiles_own_read" ON public.profiles;
CREATE POLICY "profiles_own_read" ON public.profiles
  FOR SELECT USING (id = auth.uid());


-- ============================================================
-- PATIENTS
-- ============================================================
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "patients_clinic_isolation" ON public.patients;
CREATE POLICY "patients_clinic_isolation" ON public.patients
  FOR ALL USING (clinic_id = public.get_user_clinic_id());


-- ============================================================
-- APPOINTMENTS
-- ============================================================
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_clinic_isolation" ON public.appointments;
CREATE POLICY "appointments_clinic_isolation" ON public.appointments
  FOR ALL USING (clinic_id = public.get_user_clinic_id());


-- ============================================================
-- CLINICAL RECORDS — Todos pueden leer, solo doctores/admin escriben
-- ============================================================
ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "clinical_records_read" ON public.clinical_records;
CREATE POLICY "clinical_records_read" ON public.clinical_records
  FOR SELECT USING (clinic_id = public.get_user_clinic_id());

DROP POLICY IF EXISTS "clinical_records_doctor_insert" ON public.clinical_records;
CREATE POLICY "clinical_records_doctor_insert" ON public.clinical_records
  FOR INSERT WITH CHECK (
    clinic_id = public.get_user_clinic_id()
    AND public.get_user_role() IN ('doctor', 'admin')
  );

DROP POLICY IF EXISTS "clinical_records_doctor_update" ON public.clinical_records;
CREATE POLICY "clinical_records_doctor_update" ON public.clinical_records
  FOR UPDATE USING (
    clinic_id = public.get_user_clinic_id()
    AND public.get_user_role() IN ('doctor', 'admin')
  );


-- ============================================================
-- INVOICES — Recepcionista y admin crean, todos en clínica leen
-- ============================================================
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_clinic_isolation" ON public.invoices;
CREATE POLICY "invoices_clinic_isolation" ON public.invoices
  FOR ALL USING (clinic_id = public.get_user_clinic_id());


-- ============================================================
-- INVENTORY
-- ============================================================
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "inventory_clinic_isolation" ON public.inventory;
CREATE POLICY "inventory_clinic_isolation" ON public.inventory
  FOR ALL USING (clinic_id = public.get_user_clinic_id());


-- ============================================================
-- TREATMENT JOURNEYS — Reemplazar políticas permisivas (USING true)
-- ============================================================
ALTER TABLE public.treatment_journeys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for public on journeys" ON public.treatment_journeys;
DROP POLICY IF EXISTS "treatment_journeys_clinic_isolation" ON public.treatment_journeys;
CREATE POLICY "treatment_journeys_clinic_isolation" ON public.treatment_journeys
  FOR ALL USING (clinic_id = public.get_user_clinic_id());

-- Portal del paciente: acceso público por share_token (sin auth)
DROP POLICY IF EXISTS "treatment_journeys_public_share" ON public.treatment_journeys;
CREATE POLICY "treatment_journeys_public_share" ON public.treatment_journeys
  FOR SELECT USING (share_token IS NOT NULL);


-- ============================================================
-- TREATMENT MILESTONES
-- ============================================================
ALTER TABLE public.treatment_milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for public on milestones" ON public.treatment_milestones;
DROP POLICY IF EXISTS "treatment_milestones_clinic_isolation" ON public.treatment_milestones;
CREATE POLICY "treatment_milestones_clinic_isolation" ON public.treatment_milestones
  FOR ALL USING (clinic_id = public.get_user_clinic_id());

-- Portal del paciente: acceso público via journey share_token
DROP POLICY IF EXISTS "treatment_milestones_public_share" ON public.treatment_milestones;
CREATE POLICY "treatment_milestones_public_share" ON public.treatment_milestones
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.treatment_journeys tj
      WHERE tj.id = treatment_milestones.journey_id
        AND tj.share_token IS NOT NULL
    )
  );
