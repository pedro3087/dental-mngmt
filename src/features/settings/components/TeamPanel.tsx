'use client'

import { useState, useTransition } from 'react'
import { Users, UserPlus, ShieldCheck, Stethoscope, ClipboardList, UserX, Check, AlertTriangle } from 'lucide-react'
import { updateMemberRole, deactivateMember, inviteTeamMember } from '@/actions/settings'
import type { TeamMember } from '@/actions/settings'

const ROLES = [
  { value: 'admin',        label: 'Admin',        icon: ShieldCheck,    color: 'bg-violet-100 text-violet-700' },
  { value: 'doctor',       label: 'Doctor',       icon: Stethoscope,    color: 'bg-blue-100 text-blue-700' },
  { value: 'receptionist', label: 'Recepcionista', icon: ClipboardList, color: 'bg-emerald-100 text-emerald-700' },
]

function RoleBadge({ role }: { role: string }) {
  const r = ROLES.find(x => x.value === role) ?? ROLES[2]
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${r.color}`}>
      <r.icon className="w-3 h-3" />
      {r.label}
    </span>
  )
}

function Avatar({ name, email }: { name: string | null; email: string }) {
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : email.slice(0, 2).toUpperCase()
  return (
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  )
}

function MemberRow({ member, onUpdate }: { member: TeamMember; onUpdate: () => void }) {
  const [role, setRole]       = useState(member.role)
  const [confirm, setConfirm] = useState(false)
  const [isPending, start]    = useTransition()
  const [error, setError]     = useState<string | null>(null)

  function handleRoleChange(newRole: string) {
    setRole(newRole)
    setError(null)
    start(async () => {
      const result = await updateMemberRole(member.id, newRole)
      if (result.error) { setError(result.error); setRole(member.role) }
      else onUpdate()
    })
  }

  function handleDeactivate() {
    setError(null)
    start(async () => {
      const result = await deactivateMember(member.id)
      if (result.error) { setError(result.error) }
      else onUpdate()
      setConfirm(false)
    })
  }

  if (!member.active) {
    return (
      <div className="flex items-center gap-3 py-3 px-4 opacity-50">
        <Avatar name={member.full_name} email={member.email} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 truncate">{member.email}</p>
          <p className="text-xs text-gray-400">Desactivado</p>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">Inactivo</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 py-3 px-4">
      <Avatar name={member.full_name} email={member.email} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {member.full_name || member.email}
        </p>
        {member.full_name && (
          <p className="text-xs text-gray-400 truncate">{member.email}</p>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <select
        value={role}
        onChange={e => handleRoleChange(e.target.value)}
        disabled={isPending}
        className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-60"
      >
        {ROLES.map(r => (
          <option key={r.value} value={r.value}>{r.label}</option>
        ))}
      </select>

      <RoleBadge role={role} />

      {confirm ? (
        <div className="flex items-center gap-1">
          <button
            onClick={handleDeactivate}
            disabled={isPending}
            className="text-xs text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded-lg disabled:opacity-60"
          >
            Confirmar
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirm(true)}
          className="text-gray-300 hover:text-red-400 transition-colors"
          title="Desactivar usuario"
        >
          <UserX className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export function TeamPanel({ initialMembers }: { initialMembers: TeamMember[] }) {
  const [members, setMembers]   = useState(initialMembers)
  const [inviteEmail, setEmail] = useState('')
  const [inviteRole, setIRole]  = useState('receptionist')
  const [inviteSent, setSent]   = useState(false)
  const [inviteError, setIErr]  = useState<string | null>(null)
  const [isPending, start]      = useTransition()

  // Reload page data after changes
  function handleUpdate() { window.location.reload() }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setIErr(null)
    start(async () => {
      const result = await inviteTeamMember(inviteEmail, inviteRole)
      if (result.error) { setIErr(result.error); return }
      setSent(true)
      setEmail('')
      setTimeout(() => setSent(false), 4000)
      handleUpdate()
    })
  }

  const active   = members.filter(m => m.active)
  const inactive = members.filter(m => !m.active)

  return (
    <div className="space-y-4">
      {/* Member list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Equipo</h2>
            <p className="text-xs text-gray-500">{active.length} miembro{active.length !== 1 ? 's' : ''} activo{active.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {active.map(m => (
            <MemberRow key={m.id} member={m} onUpdate={handleUpdate} />
          ))}
          {inactive.map(m => (
            <MemberRow key={m.id} member={m} onUpdate={handleUpdate} />
          ))}
          {members.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">No hay miembros aún</p>
          )}
        </div>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 p-5 border-b border-gray-100">
          <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
            <UserPlus className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Invitar al equipo</h2>
            <p className="text-xs text-gray-500">Se enviará un correo con enlace de acceso</p>
          </div>
        </div>

        <form onSubmit={handleInvite} className="p-5 space-y-3">
          <div className="flex gap-3">
            <input
              type="email"
              value={inviteEmail}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="correo@clinica.com"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <select
              value={inviteRole}
              onChange={e => setIRole(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {inviteError && (
            <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
              {inviteError}
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            {inviteSent ? (
              <><Check className="w-4 h-4" /> Invitación enviada</>
            ) : isPending ? (
              <span className="animate-pulse">Enviando...</span>
            ) : (
              <><UserPlus className="w-4 h-4" /> Enviar invitación</>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
