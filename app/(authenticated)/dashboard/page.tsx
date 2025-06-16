import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardClient } from './client-page'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: employee, error } = await supabase
    .from('workers')
    .select('id, role, is_active, name, email')
    .eq('auth_user_id', user.id)
    .single()

  if (error || !employee) {
    redirect('/login')
  }

  if (!employee.is_active) {
    redirect('/login')
  }

  return <DashboardClient employee={{
    ...employee,
    is_active: employee.is_active ?? false
  }} />
}