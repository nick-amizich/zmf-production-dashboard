import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function SettingsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // Check if user has admin permissions
  const { data: worker } = await supabase
    .from('workers')
    .select('role, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (!worker || !worker.is_active || worker.role !== 'admin') {
    redirect('/dashboard')
  }

  // Get system stats for admin dashboard
  const stats = {
    totalWorkers: 0,
    totalOrders: 0,
    activeOrders: 0,
    pendingApprovals: 0,
    systemHealth: 'operational' as const
  }

  const recentActivity: any[] = []

  return <AdminDashboard stats={stats} recentActivity={recentActivity} />
}