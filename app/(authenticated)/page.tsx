import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Suspense } from 'react'

async function AuthenticatedContent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get worker data
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!worker || !worker.is_active) {
    redirect('/login')
  }

  // Redirect to the main dashboard
  redirect('/dashboard')
}

export default async function Page() {
  await AuthenticatedContent()
  return null // This will never be rendered due to the redirect
}