export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  first_name: string
  last_name: string
  phone: string
  email: string | null
  dob: string | null
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  patient_id: string
  doctor_id: string | null
  appointment_date: string
  duration_minutes: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  whatsapp_status: 'pending' | 'sent' | 'delivered' | 'read' | 'replied'
  notes: string | null
  created_at: string
  updated_at: string
  // relations
  patients?: Patient
  profiles?: Profile
}

export interface TreatmentJourney {
  id: string
  patient_id: string
  title: string
  progress_percentage: number
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  share_token: string // To share separately
  created_at: string
  updated_at: string
}

export interface TreatmentMilestone {
  id: string
  journey_id: string
  title: string
  milestone_date: string | null
  status: 'pending' | 'current' | 'completed'
  order_index: number
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      patients: {
        Row: Patient
        Insert: Omit<Patient, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>
      }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>
      }
      treatment_journeys: {
        Row: TreatmentJourney
        Insert: Omit<TreatmentJourney, 'id' | 'created_at' | 'updated_at' | 'progress_percentage' | 'status' | 'share_token'> & Partial<Pick<TreatmentJourney, 'progress_percentage' | 'status' | 'share_token'>>
        Update: Partial<Omit<TreatmentJourney, 'id' | 'created_at' | 'updated_at'>>
      }
      treatment_milestones: {
        Row: TreatmentMilestone
        Insert: Omit<TreatmentMilestone, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TreatmentMilestone, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
