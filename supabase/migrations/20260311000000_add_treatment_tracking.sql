CREATE TABLE IF NOT EXISTS public.treatment_journeys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id uuid REFERENCES public.patients(id) ON DELETE CASCADE,
  title text NOT NULL,
  progress_percentage int DEFAULT 0,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
  share_token uuid DEFAULT gen_random_uuid() UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.treatment_milestones (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  journey_id uuid REFERENCES public.treatment_journeys(id) ON DELETE CASCADE,
  title text NOT NULL,
  milestone_date text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'current', 'completed')),
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Turn on RLS
ALTER TABLE public.treatment_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_milestones ENABLE ROW LEVEL SECURITY;

-- Set up basic RLS policies for now (Allow all for development mode, usually you map to authenticated user's clinic)
CREATE POLICY "Enable all for public on journeys" ON public.treatment_journeys FOR ALL USING (true);
CREATE POLICY "Enable all for public on milestones" ON public.treatment_milestones FOR ALL USING (true);
