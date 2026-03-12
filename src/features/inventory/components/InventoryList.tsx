'use client'

import { Package, Plus, Search, MoreHorizontal, ArrowUpDown } from 'lucide-react'

const dummyInventory = [
  { id: 'SKU-001', name: 'Resina Compuesta 3M (A2)', category: 'Material Restaurador', stock: 15, unit: 'Jeringas', status: 'optimal' },
  { id: 'SKU-002', name: 'Anestesia Lidocaína 2%', category: 'Anestésicos', stock: 120, unit: 'Cartuchos', status: 'optimal' },
  { id: 'SKU-003', name: 'Guantes de Nitrilo (M)', category: 'Desechables', stock: 8, unit: 'Cajas (100)', status: 'warning' },
  { id: 'SKU-004', name: 'Agujas Cortas 30G', category: 'Desechables', stock: 2, unit: 'Cajas (100)', status: 'critical' },
  { id: 'SKU-005', name: 'Ionomero de Vidrio (Polvo)', category: 'Cementos', stock: 5, unit: 'Frascos', status: 'optimal' },
]

export function InventoryList() {
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h3 className="text-xl font-bold flex items-center gap-2 text-gray-900">
          <Package className="w-6 h-6 text-orange-500" />
          Catálogo Principal
        </h3>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar SKU o nombre..." 
              className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
            />
          </div>
          <button className="bg-gray-900 text-white hover:bg-black px-4 py-2 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap">
            <Plus className="w-4 h-4" /> Nuevo Artículo
          </button>
        </div>
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
            <tr>
              <th className="px-4 py-3 font-semibold rounded-l-xl">SKU</th>
              <th className="px-4 py-3 font-semibold">Producto</th>
              <th className="px-4 py-3 font-semibold">Categoría</th>
              <th className="px-4 py-3 font-semibold">
                <div className="flex items-center gap-1 cursor-pointer hover:text-gray-900">
                  Stock Real <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-right rounded-r-xl"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {dummyInventory.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                <td className="px-4 py-4 font-mono text-xs text-gray-500">{item.id}</td>
                <td className="px-4 py-4 font-bold text-gray-900">{item.name}</td>
                <td className="px-4 py-4">
                  <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-black ${
                      item.status === 'critical' ? 'text-red-600' :
                      item.status === 'warning' ? 'text-amber-600' :
                      'text-gray-900'
                    }`}>
                      {item.stock}
                    </span>
                    <span className="text-xs text-gray-500">{item.unit}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-right">
                  <button className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-md transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
