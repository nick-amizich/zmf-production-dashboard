"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AuthenticatedPage() {
  const router = useRouter()

  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      // Get worker data
      const { data: worker } = await supabase
        .from('workers')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      if (!worker || !worker.is_active) {
        router.push('/login')
        return
      }

      // Redirect to the main dashboard instead of rendering here
      router.push('/dashboard')
    }

    checkAuthAndRedirect()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Authenticating...</p>
      </div>
    </div>
  )
}