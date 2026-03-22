'use client'

import { useState } from 'react'
import { FileText, Download, Send, CheckCircle2, Clock, XCircle, Receipt } from 'lucide-react'
import { updateInvoiceStatus } from '@/actions/billing'
import type { Invoice, Patient } from '@/types/database'

type InvoiceWithPatient = Invoice & { patients?: Pick<Patient, 'id' | 'full_name' | 'phone' | 'rfc'> }

const STATUS_MAP: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  draft:     { label: 'Borrador',   cls: 'bg-gray-100 text-gray-600',      icon: <Clock className="w-3.5 h-3.5" /> },
  issued:    { label: 'Timbrada',   cls: 'bg-blue-100 text-blue-700',      icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  paid:      { label: 'Pagada',     cls: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { label: 'Cancelada',  cls: 'bg-red-100 text-red-600',         icon: <XCircle className="w-3.5 h-3.5" /> },
}

function formatMXN(amount: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(amount)
}

interface InvoiceListProps {
  initialInvoices: InvoiceWithPatient[]
}

export function InvoiceList({ initialInvoices }: InvoiceListProps) {
  const [invoices, setInvoices] = useState(initialInvoices)

  async function handleStatusChange(id: string, status: 'paid' | 'cancelled') {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status } : inv))
    await updateInvoiceStatus(id, status)
  }

  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Historial de Facturas</h3>
        <span className="text-xs text-gray-400 font-medium">{invoices.length} facturas</span>
      </div>

      {invoices.length === 0 ? (
        <div className="py-12 text-center">
          <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-7 h-7 text-gray-300" />
          </div>
          <p className="text-gray-400 text-sm">No hay facturas registradas aún.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="text-xs text-gray-500 uppercase bg-gray-50">
                <th className="px-4 py-3 font-semibold rounded-l-xl">Folio / UUID</th>
                <th className="px-4 py-3 font-semibold">Paciente</th>
                <th className="px-4 py-3 font-semibold">Total</th>
                <th className="px-4 py-3 font-semibold">Estado</th>
                <th className="px-4 py-3 font-semibold text-right rounded-r-xl">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => {
                const s = STATUS_MAP[inv.status] ?? STATUS_MAP.draft
                return (
                  <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="font-bold text-gray-900">{inv.folio ?? '—'}</div>
                      <div className="text-xs text-gray-400 mt-0.5 font-mono">
                        {inv.uuid_fiscal ?? 'Sin timbrar'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-800">{inv.patients?.full_name ?? '—'}</div>
                      {inv.patients?.rfc && (
                        <div className="text-xs text-gray-400 font-mono">{inv.patients.rfc}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 font-bold text-gray-900">
                      {formatMXN(inv.amount_total)}
                      {inv.amount_tax > 0 && (
                        <div className="text-xs text-gray-400 font-normal">IVA: {formatMXN(inv.amount_tax)}</div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${s.cls}`}>
                        {s.icon} {s.label}
                      </span>
                      {inv.issued_at && (
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(inv.issued_at).toLocaleDateString('es-MX')}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {inv.pdf_url && (
                          <a href={inv.pdf_url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="PDF">
                            <Download className="w-4 h-4" />
                          </a>
                        )}
                        {inv.xml_url && (
                          <a href={inv.xml_url} target="_blank" rel="noopener noreferrer"
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="XML">
                            <FileText className="w-4 h-4" />
                          </a>
                        )}
                        {inv.status === 'issued' && (
                          <button
                            onClick={() => handleStatusChange(inv.id, 'paid')}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors" title="Marcar pagada">
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                        {inv.status !== 'cancelled' && inv.status !== 'paid' && (
                          <button
                            onClick={() => handleStatusChange(inv.id, 'cancelled')}
                            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors" title="Cancelar">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Enviar">
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
