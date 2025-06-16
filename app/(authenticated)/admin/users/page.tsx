import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { UserManagement } from '@/components/admin/user-management'

export default async function UsersPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Get worker profile and check if admin
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!worker || worker.role !== 'admin') {
    redirect('/dashboard')
  }
  
  // Get all workers
  const { data: workers } = await supabase
    .from('workers')
    .select('*')
    .order('created_at', { ascending: false })
  
  // Map database fields to component interface
  const mappedWorkers = (workers || []).map(w => ({
    ...w,
    active: w.is_active,
  })) as any[]
  
  return <UserManagement workers={mappedWorkers} />
}