'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types/database'

interface UseAuthReturn {
  user: User | null
  profile: Profile | null
  role: UserRole | null
  clinic_id: string | null
  loading: boolean
  isDoctor: boolean
  isReceptionist: boolean
  isAdmin: boolean
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    async function getProfile(userId: string) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      setProfile(data as Profile | null)
    }

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      if (user) getProfile(user.id)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const currentUser = session?.user ?? null
        setUser(currentUser)
        if (currentUser) {
          getProfile(currentUser.id)
        } else {
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const role = profile?.role ?? null

  return {
    user,
    profile,
    role,
    clinic_id: profile?.clinic_id ?? null,
    loading,
    isDoctor: role === 'doctor',
    isReceptionist: role === 'receptionist',
    isAdmin: role === 'admin',
  }
}
