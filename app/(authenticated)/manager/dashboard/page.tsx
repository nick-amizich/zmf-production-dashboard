import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductionManagerDashboard from '@/components/production/production-manager-dashboard'

export default async function ManagerDashboardPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Get employee profile and verify manager/admin role
  const { data: employee } = await supabase
    .from('employees')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!employee || !employee.active) redirect('/login')
  
  // Only managers and admins can view the manager dashboard
  if (!['manager', 'admin'].includes(employee.role)) {
    redirect('/dashboard')
  }
  
  return <ProductionManagerDashboard />
}