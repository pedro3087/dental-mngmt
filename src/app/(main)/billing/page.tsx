import { InvoiceList } from '@/features/billing/components/InvoiceList'
import { FastInvoiceWidget } from '@/features/billing/components/FastInvoiceWidget'
import { Landmark, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { getBillingStats, getInvoices } from '@/actions/billing'
import { getBillingConfig } from '@/actions/settings'
import { createClient } from '@/lib/supabase/server'

export const metadata = { title: 'Facturación CFDI 4.0 | VitalDent' }
export const revalidate = 0

function formatMXN(n: number) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)
}

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [stats, invoicesResult, patientsResult, billingConfig] = await Promise.all([
    getBillingStats(),
    getInvoices(50),
    user
      ? supabase
          .from('patients')
          .select('id, full_name, rfc')
          .order('full_name')
      : Promise.resolve({ data: [] }),
    getBillingConfig(),
  ])

  const invoices = invoicesResult.data ?? []
  const patients = (patientsResult as { data: { id: string; full_name: string; rfc: string | null }[] | null }).data ?? []

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between space-y-2 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            Facturación CFDI 4.0
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide border border-emerald-200">
              En Línea (SAT)
            </span>
          </h2>
          <p className="text-sm text-gray-500 mt-2">Emisión de facturas y control de ingresos mensuales.</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-gray-100/80 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Sincronizar PAC
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Ingresos del Mes</p>
            <h4 className="text-3xl font-black text-gray-900">
              {formatMXN(stats.ingresosMes)}
            </h4>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 mix-blend-multiply" />
          <div className="p-4 bg-amber-50 rounded-2xl relative z-10">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-gray-500">Por Cobrar</p>
            <h4 className="text-3xl font-black text-gray-900">
              {formatMXN(stats.porCobrar)}
            </h4>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl">
            <Landmark className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Facturas Timbradas</p>
            <h4 className="text-3xl font-black text-gray-900">{stats.facturasTimbradas}</h4>
          </div>
        </div>
      </div>

      {/* Grid principal */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-stretch h-full">
        <div className="h-full">
          <InvoiceList initialInvoices={invoices} />
        </div>
        <div className="h-full">
          <FastInvoiceWidget
            patients={patients}
            defaults={billingConfig.billing ?? undefined}
          />
        </div>
      </div>
    </div>
  )
}
