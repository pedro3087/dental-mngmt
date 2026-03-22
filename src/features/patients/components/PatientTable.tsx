'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { User, Phone, Mail, Search, Plus, FileText, Calendar } from 'lucide-react'
import type { Patient } from '@/types/database'
import { NewPatientModal } from './NewPatientModal'

function calcAge(birthDate: string | null): string {
  if (!birthDate) return '—'
  const diff = Date.now() - new Date(birthDate).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' años'
}

interface PatientTableProps {
  initialPatients: Patient[]
  onSearch: (q: string) => Promise<Patient[]>
}

export function PatientTable({ initialPatients, onSearch }: PatientTableProps) {
  const [patients, setPatients] = useState(initialPatients)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSearch(value: string) {
    setSearch(value)
    startTransition(async () => {
      const results = await onSearch(value)
      setPatients(results)
    })
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Pacientes</h2>
          <p className="text-sm text-gray-500 mt-1">
            {patients.length} paciente{patients.length !== 1 ? 's' : ''} registrado{patients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nuevo Paciente
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Buscar por nombre, teléfono o email..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        {isPending && (
          <span className="absolute right-3 top-2.5 text-xs text-gray-400 animate-pulse">Buscando...</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
        {patients.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-500 font-medium">
              {search ? 'No se encontraron pacientes' : 'Aún no hay pacientes registrados'}
            </p>
            {!search && (
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 text-blue-600 text-sm font-medium hover:underline"
              >
                Registrar primer paciente
              </button>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-6 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Paciente</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider hidden md:table-cell">Contacto</th>
                <th className="text-left px-6 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider hidden lg:table-cell">Edad</th>
                <th className="text-right px-6 py-3 font-semibold text-gray-500 uppercase text-xs tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {patients.map((p) => (
                <tr key={p.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-700 font-bold text-sm">
                          {p.full_name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{p.full_name}</p>
                        <p className="text-xs text-gray-400">
                          {p.gender === 'M' ? 'Masculino' : p.gender === 'F' ? 'Femenino' : p.gender === 'otro' ? 'Otro' : '—'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <div className="space-y-1">
                      {p.phone && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Phone className="w-3.5 h-3.5 text-gray-400" />
                          {p.phone}
                        </div>
                      )}
                      {p.email && (
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          {p.email}
                        </div>
                      )}
                      {!p.phone && !p.email && <span className="text-gray-300">Sin contacto</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell text-gray-600">
                    {calcAge(p.birth_date)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/clinical/${p.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Expediente
                      </Link>
                      <Link
                        href={`/agenda?patient=${p.id}`}
                        className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        Cita
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <NewPatientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={(patient) => setPatients(prev => [patient, ...prev])}
      />
    </div>
  )
}
