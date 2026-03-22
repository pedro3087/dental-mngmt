-- Configurable services per clinic
CREATE TABLE IF NOT EXISTS booking_services (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id    uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  label        text NOT NULL,
  emoji        text NOT NULL DEFAULT '🦷',
  duration_min integer NOT NULL DEFAULT 60,
  description  text,
  tag          text,
  accent       text NOT NULL DEFAULT 'blue',
  active       boolean NOT NULL DEFAULT true,
  order_index  integer NOT NULL DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- Availability schedule per clinic (one row per clinic)
CREATE TABLE IF NOT EXISTS booking_settings (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id      uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
  open_days      integer[] NOT NULL DEFAULT '{1,2,3,4,5,6}',
  start_hour     integer NOT NULL DEFAULT 9,
  end_hour       integer NOT NULL DEFAULT 19,
  slot_interval  integer NOT NULL DEFAULT 30,
  booking_active boolean NOT NULL DEFAULT true,
  updated_at     timestamptz DEFAULT now()
);

ALTER TABLE booking_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_settings ENABLE ROW LEVEL SECURITY;

-- Clinic staff can read/write their own clinic config
CREATE POLICY "staff_booking_services_all" ON booking_services
  USING  (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "staff_booking_settings_all" ON booking_settings
  USING  (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()))
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM profiles WHERE id = auth.uid()));

-- Anon can read active services + settings (for public booking page)
CREATE POLICY "anon_read_active_services" ON booking_services
  FOR SELECT TO anon USING (active = true);

CREATE POLICY "anon_read_booking_settings" ON booking_settings
  FOR SELECT TO anon USING (booking_active = true);

-- Seed default services for VitalDent
INSERT INTO booking_services (clinic_id, label, emoji, duration_min, description, tag, accent, active, order_index)
VALUES
  ('e94a8c0d-174c-44b2-89c3-8d52483f15d3','Consulta General',   '🦷', 30, 'Primera visita, revisión y diagnóstico completo', NULL,      'blue',    true, 1),
  ('e94a8c0d-174c-44b2-89c3-8d52483f15d3','Limpieza Dental',    '✨', 60, 'Limpieza profunda y eliminación de sarro',        'Popular', 'cyan',    true, 2),
  ('e94a8c0d-174c-44b2-89c3-8d52483f15d3','Blanqueamiento LED', '⚡', 90, 'Hasta 8 tonos más blanco en una sesión',          'Nuevo',   'amber',   true, 3),
  ('e94a8c0d-174c-44b2-89c3-8d52483f15d3','Ortodoncia',         '🔧', 60, 'Brackets, alineadores transparentes y ajustes',   NULL,      'violet',  true, 4),
  ('e94a8c0d-174c-44b2-89c3-8d52483f15d3','Extracción',         '💊', 45, 'Extracción simple o quirúrgica sin dolor',         NULL,      'rose',    true, 5),
  ('e94a8c0d-174c-44b2-89c3-8d52483f15d3','Implante Dental',    '🏆', 120,'Consulta y plan personalizado de implante',        NULL,      'emerald', true, 6)
ON CONFLICT DO NOTHING;

-- Seed default schedule for VitalDent
INSERT INTO booking_settings (clinic_id, open_days, start_hour, end_hour, slot_interval, booking_active)
VALUES ('e94a8c0d-174c-44b2-89c3-8d52483f15d3', '{1,2,3,4,5,6}', 9, 19, 30, true)
ON CONFLICT (clinic_id) DO NOTHING;
