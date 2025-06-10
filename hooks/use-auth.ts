'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

type Worker = Database['public']['Tables']['workers']['Row']

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          setUser(user)
          
          // Fetch worker data
          const { data: workerData } = await supabase
            .from('workers')
            .select('*')
            .eq('auth_user_id', user.id)
            .single()
          
          if (workerData) {
            setWorker(workerData)
          }
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        
        // Fetch worker data
        const { data: workerData } = await supabase
          .from('workers')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single()
        
        if (workerData) {
          setWorker(workerData)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setWorker(null)
        router.push('/login')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [router, supabase])

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return {
    user,
    worker,
    loading,
    signOut,
    isManager: worker?.role === 'manager' || worker?.role === 'admin',
    isAdmin: worker?.role === 'admin',
  }
}