// ============================================================
// VitalDent — Tipos de base de datos (sincronizados con schema Supabase)
// ============================================================

export type UserRole = 'doctor' | 'receptionist' | 'admin'

export interface Clinic {
  id: string
  name: string
  slug: string
  phone: string | null
  address: string | null
  rfc: string | null
  pac_credentials: Record<string, unknown> | null
  logo_url: string | null
  primary_color: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  full_name: string | null
  avatar_url: string | null
  clinic_id: string | null
  role: UserRole
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  clinic_id: string
  full_name: string
  phone: string | null
  email: string | null
  birth_date: string | null
  gender: 'M' | 'F' | 'otro' | null
  rfc: string | null
  cfdi_use: string
  anamnesis: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  clinic_id: string
  patient_id: string
  doctor_id: string | null
  scheduled_at: string
  duration_min: number
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  service_type: string | null
  amount_mxn: number | null
  notes: string | null
  created_at: string
  updated_at: string
  // Relations (populated by joins)
  patients?: Patient
  profiles?: Profile
}

export interface ClinicalRecord {
  id: string
  patient_id: string
  doctor_id: string
  clinic_id: string
  appointment_id: string | null
  odontogram: Record<string, unknown>
  diagnosis: string | null
  treatment_plan: string | null
  notes: string | null
  image_urls: string[]
  prescription: Record<string, unknown>
  created_at: string
  updated_at: string
  patients?: Patient
  profiles?: Profile
}

export interface Invoice {
  id: string
  patient_id: string
  clinic_id: string
  appointment_id: string | null
  folio: string | null
  uuid_fiscal: string | null
  amount_subtotal: number
  amount_tax: number
  amount_total: number
  payment_method: 'PUE' | 'PPD'
  payment_form: string
  cfdi_use: string
  status: 'draft' | 'issued' | 'cancelled' | 'paid'
  xml_url: string | null
  pdf_url: string | null
  issued_at: string | null
  created_at: string
  updated_at: string
  patients?: Patient
}

export interface InventoryItem {
  id: string
  clinic_id: string
  name: string
  sku: string | null
  category: string | null
  unit: string
  quantity_current: number
  quantity_min: number
  unit_cost: number | null
  expiry_date: string | null
  supplier: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface TreatmentJourney {
  id: string
  patient_id: string
  clinic_id: string
  title: string
  progress_percentage: number
  status: 'active' | 'completed' | 'paused' | 'cancelled'
  share_token: string
  created_at: string
  updated_at: string
  treatment_milestones?: TreatmentMilestone[]
  patients?: Pick<Patient, 'full_name'>
}

export interface TreatmentMilestone {
  id: string
  journey_id: string
  clinic_id: string
  title: string
  milestone_date: string | null
  status: 'pending' | 'current' | 'completed'
  order_index: number
  created_at: string
  updated_at: string
}

// ============================================================
// Supabase Database type (para el cliente tipado)
// ============================================================
export interface Database {
  public: {
    Tables: {
      clinics: {
        Row: Clinic
        Insert: Omit<Clinic, 'id' | 'created_at' | 'updated_at' | 'primary_color'> & Partial<Pick<Clinic, 'primary_color'>>
        Update: Partial<Omit<Clinic, 'id' | 'created_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at' | 'role'> & Partial<Pick<Profile, 'role'>>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
      }
      patients: {
        Row: Patient
        Insert: Omit<Patient, 'id' | 'created_at' | 'updated_at' | 'cfdi_use' | 'anamnesis'> & Partial<Pick<Patient, 'cfdi_use' | 'anamnesis'>>
        Update: Partial<Omit<Patient, 'id' | 'created_at' | 'updated_at'>>
      }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>
      }
      clinical_records: {
        Row: ClinicalRecord
        Insert: Omit<ClinicalRecord, 'id' | 'created_at' | 'updated_at' | 'odontogram' | 'image_urls' | 'prescription'> & Partial<Pick<ClinicalRecord, 'odontogram' | 'image_urls' | 'prescription'>>
        Update: Partial<Omit<ClinicalRecord, 'id' | 'created_at' | 'updated_at'>>
      }
      invoices: {
        Row: Invoice
        Insert: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'status'> & Partial<Pick<Invoice, 'status'>>
        Update: Partial<Omit<Invoice, 'id' | 'created_at' | 'updated_at'>>
      }
      inventory: {
        Row: InventoryItem
        Insert: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at' | 'quantity_current' | 'quantity_min' | 'unit'> & Partial<Pick<InventoryItem, 'quantity_current' | 'quantity_min' | 'unit'>>
        Update: Partial<Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>>
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
