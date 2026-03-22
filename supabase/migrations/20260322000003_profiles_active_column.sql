-- Add active column to profiles for soft-delete of team members
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS active BOOLEAN NOT NULL DEFAULT true;

-- Index for filtering active members per clinic
CREATE INDEX IF NOT EXISTS profiles_clinic_active_idx
  ON public.profiles (clinic_id, active);
