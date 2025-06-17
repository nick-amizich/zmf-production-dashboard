import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BuildsClient from './client-page'

export default async function BuildsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: employee } = await supabase
    .from('employees')
    .select('id, role, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (!employee?.is_active) {
    redirect('/login')
  }

  return <BuildsClient />
}