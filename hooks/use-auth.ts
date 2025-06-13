'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { User, AuthChangeEvent, Session } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

type Worker = Database['public']['Tables']['workers']['Row']

interface AuthState {
  user: User | null
  worker: Worker | null
  loading: boolean
  error: string | null
  isInitialized: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    worker: null,
    loading: true,
    error: null,
    isInitialized: false,
  })
  
  const router = useRouter()
  const supabase = createClient()
  const initializingRef = useRef(false)
  const refreshTimeoutRef = useRef<NodeJS.Timeout>()

  // Memoized function to fetch worker profile
  const fetchWorkerProfile = useCallback(async (userId: string) => {
    try {
      const { data: worker, error: workerError } = await supabase
        .from('workers')
        .select('*')
        .eq('auth_user_id', userId)
        .single()
        
      if (workerError) {
        if (workerError.code === 'PGRST116') {
          // No worker profile found
          return { worker: null, error: 'No worker profile found' }
        }
        throw workerError
      }
      
      if (!worker?.is_active) {
        return { worker, error: 'Your account is inactive. Please contact an administrator.' }
      }
      
      return { worker, error: null }
    } catch (error) {
      return { worker: null, error: 'Failed to load worker profile' }
    }
  }, [supabase])

  // Initialize auth state
  const initializeAuth = useCallback(async () => {
    if (initializingRef.current) return
    initializingRef.current = true

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        // Handle token refresh errors
        if (userError.message?.includes('refresh_token_not_found')) {
          setAuthState({
            user: null,
            worker: null,
            loading: false,
            error: null,
            isInitialized: true,
          })
          return
        }
        throw userError
      }
      
      if (user) {
        const { worker, error } = await fetchWorkerProfile(user.id)
        
        setAuthState({
          user,
          worker,
          loading: false,
          error,
          isInitialized: true,
        })
      } else {
        setAuthState({
          user: null,
          worker: null,
          loading: false,
          error: null,
          isInitialized: true,
        })
      }
    } catch (error) {
      setAuthState({
        user: null,
        worker: null,
        loading: false,
        error: 'Authentication error',
        isInitialized: true,
      })
    } finally {
      initializingRef.current = false
    }
  }, [supabase, fetchWorkerProfile])

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (
    event: AuthChangeEvent,
    session: Session | null
  ) => {
    // Prevent concurrent auth state changes
    if (initializingRef.current) return

    switch (event) {
      case 'SIGNED_IN':
        if (session?.user) {
          const { worker, error } = await fetchWorkerProfile(session.user.id)
          setAuthState({
            user: session.user,
            worker,
            loading: false,
            error,
            isInitialized: true,
          })
        }
        break
        
      case 'SIGNED_OUT':
        setAuthState({
          user: null,
          worker: null,
          loading: false,
          error: null,
          isInitialized: true,
        })
        router.push('/login')
        break
        
      case 'TOKEN_REFRESHED':
        // Token was successfully refreshed, update user if needed
        if (session?.user && authState.user?.id !== session.user.id) {
          const { worker, error } = await fetchWorkerProfile(session.user.id)
          setAuthState(prev => ({
            ...prev,
            user: session.user,
            worker,
            error,
          }))
        }
        break
        
      case 'USER_UPDATED':
        if (session?.user) {
          setAuthState(prev => ({
            ...prev,
            user: session.user,
          }))
        }
        break
    }
  }, [fetchWorkerProfile, router, authState.user?.id])

  useEffect(() => {
    initializeAuth()

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange)

    // Set up token refresh check
    const checkTokenRefresh = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error || !session) return

        const expiresAt = session.expires_at
        if (!expiresAt) return

        const now = Math.floor(Date.now() / 1000)
        const timeUntilExpiry = expiresAt - now
        
        // Refresh token 5 minutes before expiry
        if (timeUntilExpiry < 300) {
          await supabase.auth.refreshSession()
        }
        
        // Schedule next check
        const nextCheck = Math.max((timeUntilExpiry - 300) * 1000, 60000) // At least 1 minute
        refreshTimeoutRef.current = setTimeout(checkTokenRefresh, nextCheck)
      } catch (error) {
        // Silent fail - auth state change will handle any issues
      }
    }

    // Start token refresh checking
    checkTokenRefresh()

    return () => {
      subscription.unsubscribe()
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current)
      }
    }
  }, []) // Only run once on mount

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      setAuthState(prev => ({ 
        ...prev, 
        loading: false,
        error: 'Failed to sign out. Please try again.'
      }))
    }
  }

  return {
    ...authState,
    signOut,
    isAuthenticated: !!authState.user && !!authState.worker && authState.worker.is_active && !authState.error,
    isManager: authState.worker?.role === 'manager' || authState.worker?.role === 'admin',
    isAdmin: authState.worker?.role === 'admin',
  }
}