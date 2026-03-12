'use client'

import { FileText, Download, Send, CheckCircle2, Clock } from 'lucide-react'

const dummyInvoices = [
  { id: 'INV-2026-001', patient: 'Carlos Mendoza', amount: '$1,500 MXN', status: 'paid', date: '11 Mar 2026', cfdi: 'A-4928' },
  { id: 'INV-2026-002', patient: 'Ana Soto', amount: '$4,200 MXN', status: 'pending', date: '10 Mar 2026', cfdi: 'A-4927' },
  { id: 'INV-2026-003', patient: 'Luis Garza', amount: '$850 MXN', status: 'paid', date: '08 Mar 2026', cfdi: 'A-4926' },
  { id: 'INV-2026-004', patient: 'María Elena', amount: '$12,000 MXN', status: 'processing', date: '08 Mar 2026', cfdi: 'Pendiente' },
]

export function InvoiceList() {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden h-full">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Historial de Facturas</h3>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">
          Ver Todas
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-l-xl">ID / Folio CFDI</th>
              <th className="px-4 py-3 font-semibold">Paciente</th>
              <th className="px-4 py-3 font-semibold">Monto</th>
              <th className="px-4 py-3 font-semibold">Estado (SAT)</th>
              <th className="px-4 py-3 font-semibold text-right rounded-r-xl">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dummyInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-4 py-4">
                  <div className="font-bold text-gray-900">{inv.id}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <FileText className="w-3 h-3" /> Folio: {inv.cfdi}
                  </div>
                </td>
                <td className="px-4 py-4 font-medium text-gray-700">{inv.patient}</td>
                <td className="px-4 py-4 font-bold text-gray-900">{inv.amount}</td>
                <td className="px-4 py-4">
                  {inv.status === 'paid' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Timbrada
                    </span>
                  )}
                  {inv.status === 'pending' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">
                      <Clock className="w-3.5 h-3.5" /> Por Cobrar
                    </span>
                  )}
                  {inv.status === 'processing' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 animate-pulse">
                      <Send className="w-3.5 h-3.5" /> Procesando PAC...
                    </span>
                  )}
                </td>
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Descargar PDF">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Descargar XML">
                      <FileText className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Reenviar por Correo/WhatsApp">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
