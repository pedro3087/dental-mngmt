import { InventoryList } from '@/features/inventory/components/InventoryList'
import { LowStockAlerts } from '@/features/inventory/components/LowStockAlerts'
import { PackageOpen, Activity, RefreshCcw } from 'lucide-react'

export const metadata = {
  title: 'Inventario Clínico | VitalDent',
}

export default function InventoryPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6 h-[calc(100vh-2rem)] flex flex-col">
      
      {/* Header del Inventario */}
      <div className="flex items-center justify-between space-y-2 mb-8 border-b border-gray-100 pb-6 shrink-0">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            Gestión de Inventario
            <span className="bg-orange-100/50 text-orange-700 text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wide border border-orange-200">Control de Insumos</span>
          </h2>
          <p className="text-sm text-gray-500 mt-2">Monitoreo de material, historial de compras y alertas tempranas.</p>
        </div>
        
        <div className="flex gap-2">
          <button className="bg-white hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-xl border border-gray-200 font-medium transition-colors flex items-center gap-2 shadow-sm">
            <RefreshCcw className="w-4 h-4" /> Sincronizar Proveedores
          </button>
        </div>
      </div>

      {/* Tarjetas de Métricas de Inventario */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 shrink-0">
        <div className="bg-white border text-gray-900 border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-orange-50 rounded-2xl">
            <PackageOpen className="w-8 h-8 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Valor Estimado del Almacén</p>
            <h4 className="text-3xl font-black text-gray-900">$48,200<span className="text-lg text-gray-400 font-semibold ml-1">MXN</span></h4>
          </div>
        </div>

        <div className="bg-white border text-gray-900 border-gray-100 rounded-3xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-4 bg-emerald-50 rounded-2xl">
            <Activity className="w-8 h-8 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500">Estado General</p>
            <div className="flex items-baseline gap-2">
              <h4 className="text-3xl font-black text-gray-900">Saludable</h4>
              <span className="text-xs font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200">92% Insumos OK</span>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Bento para Inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-6 flex-1 min-h-[500px]">
        {/* Panel Izquierdo: Alertas de Stock (Más visible por criticidad) */}
        <div className="h-full">
          <LowStockAlerts />
        </div>

        {/* Panel Derecho: Lista Base Completa */}
        <div className="h-full">
          <InventoryList />
        </div>
      </div>
    </div>
  )
}
