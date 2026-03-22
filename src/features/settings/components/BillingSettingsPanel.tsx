'use client'

import { useState, useTransition } from 'react'
import { Receipt, ShieldCheck, Check, Eye, EyeOff } from 'lucide-react'
import { updateBillingSettings, updatePacCredentials } from '@/actions/settings'
import type { BillingSettings, PacCredentials } from '@/actions/settings'

const PAYMENT_METHODS = [
  { value: 'PUE', label: 'PUE — Pago en una Exhibición' },
  { value: 'PPD', label: 'PPD — Pago en Parcialidades o Diferido' },
]

const PAYMENT_FORMS = [
  { value: '01', label: '01 — Efectivo' },
  { value: '04', label: '04 — Tarjeta de Crédito/Débito' },
  { value: '28', label: '28 — Tarjeta de Débito' },
  { value: '03', label: '03 — Transferencia Electrónica' },
]

const CFDI_USES = [
  { value: 'D01', label: 'D01 — Honorarios Médicos y Dentales' },
  { value: 'G03', label: 'G03 — Gastos en General' },
  { value: 'P01', label: 'P01 — Por Definir' },
]

const PAC_PROVIDERS = [
  { value: 'finkok',    label: 'Finkok' },
  { value: 'sw',       label: 'SW SapienWare' },
  { value: 'edicom',   label: 'Edicom' },
  { value: 'diverza',  label: 'Diverza' },
]

interface Props {
  initialBilling: BillingSettings | null
  initialPac:     PacCredentials | null
}

export function BillingSettingsPanel({ initialBilling, initialPac }: Props) {
  // Billing defaults form
  const [billing, setBilling] = useState({
    taxRate:        initialBilling?.tax_rate         ?? 0,
    paymentMethod:  initialBilling?.payment_method   ?? 'PUE',
    paymentForm:    initialBilling?.payment_form     ?? '01',
    cfdiUseDefault: initialBilling?.cfdi_use_default ?? 'G03',
  })
  const [billingSaved, setBillingSaved]   = useState(false)
  const [billingError, setBillingError]   = useState<string | null>(null)
  const [billingPending, startBilling]    = useTransition()

  // PAC credentials form
  const [pac, setPac] = useState({
    provider: initialPac?.provider ?? 'finkok',
    username: initialPac?.username ?? '',
    password: initialPac?.password ?? '',
    sandbox:  initialPac?.sandbox  ?? true,
  })
  const [showPassword, setShowPassword]   = useState(false)
  const [pacSaved, setPacSaved]           = useState(false)
  const [pacError, setPacError]           = useState<string | null>(null)
  const [pacPending, startPac]            = useTransition()

  function handleBillingSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBillingError(null)
    startBilling(async () => {
      const result = await updateBillingSettings(billing)
      if (result.error) { setBillingError(result.error); return }
      setBillingSaved(true)
      setTimeout(() => setBillingSaved(false), 3000)
    })
  }

  function handlePacSubmit(e: React.FormEvent) {
    e.preventDefault()
    setPacError(null)
    startPac(async () => {
      const result = await updatePacCredentials(pac)
      if (result.error) { setPacError(result.error); return }
      setPacSaved(true)
      setTimeout(() => setPacSaved(false), 3000)
    })
  }

  return (
    <div className="space-y-4">
      {/* Billing defaults */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
            <Receipt className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Valores Predeterminados de Factura</h2>
            <p className="text-xs text-gray-500">Se pre-seleccionan al crear cada factura</p>
          </div>
        </div>

        <form onSubmit={handleBillingSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Método de Pago</label>
              <select
                value={billing.paymentMethod}
                onChange={e => setBilling(b => ({ ...b, paymentMethod: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                {PAYMENT_METHODS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Forma de Pago</label>
              <select
                value={billing.paymentForm}
                onChange={e => setBilling(b => ({ ...b, paymentForm: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                {PAYMENT_FORMS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Uso CFDI</label>
              <select
                value={billing.cfdiUseDefault}
                onChange={e => setBilling(b => ({ ...b, cfdiUseDefault: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                {CFDI_USES.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">IVA Predeterminado</label>
              <select
                value={billing.taxRate}
                onChange={e => setBilling(b => ({ ...b, taxRate: Number(e.target.value) }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value={0}>0% — Exento (dental)</option>
                <option value={16}>16% — Tasa general</option>
              </select>
            </div>
          </div>

          {billingError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{billingError}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={billingPending}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              {billingSaved ? (
                <><Check className="w-4 h-4" /> Guardado</>
              ) : billingPending ? (
                <span className="animate-pulse">Guardando...</span>
              ) : (
                'Guardar defaults'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* PAC Credentials */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Credenciales PAC (CFDI 4.0)</h2>
            <p className="text-xs text-gray-500">Proveedor Autorizado de Certificación para timbrado</p>
          </div>
        </div>

        <form onSubmit={handlePacSubmit} className="p-5 space-y-4">
          {/* Proveedor + Ambiente */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Proveedor PAC</label>
              <select
                value={pac.provider}
                onChange={e => setPac(p => ({ ...p, provider: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
              >
                {PAC_PROVIDERS.map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-gray-700">Ambiente</label>
              <div className="flex items-center gap-3 h-[42px]">
                <button
                  type="button"
                  onClick={() => setPac(p => ({ ...p, sandbox: !p.sandbox }))}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    pac.sandbox ? 'bg-amber-400' : 'bg-indigo-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    pac.sandbox ? 'translate-x-1' : 'translate-x-6'
                  }`} />
                </button>
                <span className={`text-xs font-medium ${pac.sandbox ? 'text-amber-600' : 'text-indigo-600'}`}>
                  {pac.sandbox ? 'Sandbox' : 'Producción'}
                </span>
              </div>
            </div>
          </div>

          {/* Usuario */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Usuario PAC</label>
            <input
              value={pac.username}
              onChange={e => setPac(p => ({ ...p, username: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="usuario@clinica.com"
              autoComplete="off"
            />
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-gray-700">Contraseña PAC</label>
            <div className="relative">
              <input
                value={pac.password}
                onChange={e => setPac(p => ({ ...p, password: e.target.value }))}
                type={showPassword ? 'text' : 'password'}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {pac.sandbox && (
            <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
              Modo Sandbox activo — las facturas no tienen validez fiscal. Cambia a Producción cuando estés listo.
            </p>
          )}

          {pacError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{pacError}</p>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={pacPending}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
            >
              {pacSaved ? (
                <><Check className="w-4 h-4" /> Guardado</>
              ) : pacPending ? (
                <span className="animate-pulse">Guardando...</span>
              ) : (
                'Guardar credenciales'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
