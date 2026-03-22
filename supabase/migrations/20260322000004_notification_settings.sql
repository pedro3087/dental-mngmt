-- Notification and chatbot settings per clinic
CREATE TABLE IF NOT EXISTS public.notification_settings (
  clinic_id           UUID        PRIMARY KEY REFERENCES public.clinics(id) ON DELETE CASCADE,
  wa_enabled          BOOLEAN     NOT NULL DEFAULT false,
  email_enabled       BOOLEAN     NOT NULL DEFAULT false,
  reminder_hours_1    INT         NOT NULL DEFAULT 24,
  reminder_hours_2    INT         NOT NULL DEFAULT 48,
  reminder_template   TEXT        NOT NULL DEFAULT '{nombre}, te recordamos tu cita el {fecha} a las {hora}.',
  chatbot_greeting    TEXT        NOT NULL DEFAULT 'Hola, soy el asistente virtual de la clínica. ¿En qué te puedo ayudar hoy?',
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;

-- Clinic staff can read/write their own clinic settings
DROP POLICY IF EXISTS "notification_settings_clinic_isolation" ON public.notification_settings;
CREATE POLICY "notification_settings_clinic_isolation" ON public.notification_settings
  FOR ALL
  USING  (clinic_id = public.get_user_clinic_id())
  WITH CHECK (clinic_id = public.get_user_clinic_id());

-- Anon can read chatbot_greeting for the patient portal (public chatbot)
DROP POLICY IF EXISTS "anon_read_chatbot_greeting" ON public.notification_settings;
CREATE POLICY "anon_read_chatbot_greeting" ON public.notification_settings
  FOR SELECT TO anon
  USING (true);

-- Seed default for VitalDent
INSERT INTO public.notification_settings (clinic_id)
VALUES ('e94a8c0d-174c-44b2-89c3-8d52483f15d3')
ON CONFLICT (clinic_id) DO NOTHING;
