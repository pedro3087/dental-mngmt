'use client'

import { AlertTriangle, TrendingDown, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'

export function LowStockAlerts() {
  const alerts = [
    { id: 1, name: 'Agujas Cortas 30G', current: 2, min: 10, supplier: 'DentalMed', urgency: 'high' },
    { id: 2, name: 'Guantes de Nitrilo (M)', current: 8, min: 20, supplier: 'MedSupplies', urgency: 'medium' },
  ]

  return (
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200/50 rounded-3xl p-6 shadow-sm overflow-hidden relative h-full flex flex-col">
      <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
        <TrendingDown className="w-48 h-48 transform -rotate-12" />
      </div>

      <div className="flex flex-col h-full relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center border border-amber-200 shadow-sm">
            <AlertTriangle className="w-6 h-6 text-amber-600 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-amber-900">Alertas de Stock</h3>
            <p className="text-amber-700 text-xs font-semibold uppercase tracking-wider mt-0.5">2 insumos críticos</p>
          </div>
        </div>

        <div className="space-y-4 flex-1">
          {alerts.map((alert, index) => (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={alert.id} 
              className="bg-white border text-gray-900 border-amber-200/60 rounded-2xl p-4 shadow-sm group hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-900 leading-tight">{alert.name}</h4>
                {alert.urgency === 'high' && (
                  <span className="bg-red-100 text-red-700 text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Urgente
                  </span>
                )}
              </div>
              
              <div className="flex items-end justify-between mt-3">
                <div className="flex gap-4">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Actual</p>
                    <p className={`text-xl font-black ${alert.urgency === 'high' ? 'text-red-500' : 'text-amber-500'}`}>
                      {alert.current}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-gray-400">Mínimo</p>
                    <p className="text-xl font-black text-gray-700">{alert.min}</p>
                  </div>
                </div>
                
                <button className="bg-amber-100/50 hover:bg-amber-100 text-amber-900 p-2 rounded-xl transition-colors shrink-0" title={`Pedir a ${alert.supplier}`}>
                  <ShoppingCart className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-amber-200/50">
          <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20 text-sm">
            Generar Orden de Compra (PDF)
          </button>
        </div>
      </div>
    </div>
  )
}
