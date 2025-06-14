import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ProductionDashboard from '@/components/production/production-dashboard'

export default async function ProductionDashboardPage() {
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
  
  // Only managers and admins can view the production dashboard
  if (!['manager', 'admin'].includes(employee.role)) {
    redirect('/production')
  }
  
  return <ProductionDashboard />
}