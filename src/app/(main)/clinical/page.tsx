import { createClient } from '@/lib/supabase/server'
import { UserCircle, Search, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export const metadata = {
  title: 'Directorio de Pacientes | VitalDent',
}

export default async function ClinicalDirectoryPage() {
  const supabase = await createClient()

  // Obtener todos los pacientes ordenados
  const { data: patients } = await supabase
    .from('patients')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      
      {/* Header del Directorio */}
      <div className="flex items-center justify-between space-y-2 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            Expedientes Clínicos
            <span className="bg-blue-100/50 text-blue-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide border border-blue-200">
              {patients?.length || 0} Registrados
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-2">Busca y selecciona un paciente para ver o editar su expediente médico y odontograma.</p>
        </div>
      </div>

      <div className="bg-white border text-gray-900 border-gray-100 rounded-3xl p-6 shadow-sm min-h-[500px]">
        {/* Barra de b[usqueda */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar por nombre, teléfono o ID..." 
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-2xl pl-12 pr-4 py-3 focus:ring-blue-500 focus:border-blue-500 font-medium"
          />
        </div>

        {/* Lista de pacientes */}
        <div className="space-y-3">
          {patients?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No hay pacientes registrados aún. Comienza agendando una cita.
            </div>
          )}
          
          {patients?.map((patient) => (
            <Link 
              href={`/clinical/${patient.id}`} 
              key={patient.id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 bg-white hover:bg-gray-50 hover:border-blue-200 transition-all shadow-sm hover:shadow-md cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-700 transition-colors">
                    {patient.first_name} {patient.last_name}
                  </h3>
                  <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                    <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded-full">{patient.id.split('-')[0].toUpperCase()}</span>
                    <span>{patient.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 sm:mt-0 flex items-center gap-4 sm:self-center self-end">
                <span className="text-xs font-bold text-gray-400 group-hover:text-blue-600 flex items-center gap-1 transition-colors uppercase tracking-wider">
                  Ver Expediente <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
