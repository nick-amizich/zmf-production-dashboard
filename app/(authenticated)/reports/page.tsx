import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ReportsHub } from '@/components/reports/reports-hub'

export default async function ReportsPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Get worker profile and check if manager
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!worker || (worker.role !== 'manager' && worker.role !== 'admin')) {
    redirect('/dashboard')
  }
  
  return <ReportsHub />
}