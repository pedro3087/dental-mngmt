import { getPatients } from '@/actions/patients'
import { PatientTable } from '@/features/patients/components/PatientTable'
import type { Patient } from '@/types/database'

export const revalidate = 0

export default async function PacientesPage() {
  const { data: patients } = await getPatients()

  async function searchPatients(q: string): Promise<Patient[]> {
    'use server'
    const { data } = await getPatients(q)
    return data ?? []
  }

  return <PatientTable initialPatients={patients ?? []} onSearch={searchPatients} />
}
