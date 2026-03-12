import { InvoiceList } from '@/features/billing/components/InvoiceList'
import { FastInvoiceWidget } from '@/features/billing/components/FastInvoiceWidget'
import { Landmark, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'

export const metadata = {
  title: 'Facturación CFDI 4.0 | VitalDent',
}

export default function BillingPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      
      {/* Header del Módulo */}
      <div className="flex items-center justify-between space-y-2 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            Facturación CFDI 4.0
            <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide border border-emerald-200">En Línea (SAT)</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2">Emisión de facturas y control de ingresos mensuales.</p>
        </div>
        
        <div className="flex gap-2">
          <button className="bg-gray-100/80 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl font-medium transition-colors flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Sincronizar PAC
          </button>
        </div>
      </div>

      {/* Tarjetas de Metricas Financieras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border text-gray-900 border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl">
            <TrendingUp className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Ingresos del Mes</p>
            <h4 className="text-3xl font-black text-gray-900">$124,500<span className="text-lg text-gray-400 font-semibold ml-1">MXN</span></h4>
          </div>
        </div>

        <div className="bg-white border text-gray-900 border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 mix-blend-multiply"></div>
          <div className="p-4 bg-amber-50 rounded-2xl relative z-10">
            <AlertCircle className="w-8 h-8 text-amber-500" />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-semibold text-gray-500">Por Cobrar</p>
            <h4 className="text-3xl font-black text-gray-900">$16,200<span className="text-lg text-gray-400 font-semibold ml-1">MXN</span></h4>
          </div>
        </div>

        <div className="bg-white border text-gray-900 border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl">
            <Landmark className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Facturas Timbradas</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-3xl font-black text-gray-900">42</h4>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">+12% vs mes pasado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Principal Layout - Bento Style */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 items-stretch h-full"> 
        {/* Lista Central - Ocupa 2/3 de pantalla */}
        <div className="h-full">
          <InvoiceList />
        </div>

        {/* Panel Derecho de Cobro Rápido - Ocupa 1/3 */}
        <div className="h-full">
          <FastInvoiceWidget />
        </div>
      </div>
    </div>
  )
}
