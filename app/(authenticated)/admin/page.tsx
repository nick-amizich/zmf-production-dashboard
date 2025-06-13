import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/admin-dashboard'

export default async function AdminPage() {
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
  
  // Get system stats
  const [
    { count: totalWorkers },
    { count: totalOrders },
    { count: activeOrders },
    { data: recentActivity },
    { count: pendingApprovals }
  ] = await Promise.all([
    supabase.from('workers').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true })
      .in('status', ['pending', 'in_progress']),
    supabase.from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('workers').select('*', { count: 'exact', head: true })
      .eq('approval_status', 'pending')
  ])
  
  const systemStats = {
    totalWorkers: totalWorkers || 0,
    totalOrders: totalOrders || 0,
    activeOrders: activeOrders || 0,
    pendingApprovals: pendingApprovals || 0,
    systemHealth: 'operational' as const
  }
  
  return (
    <AdminDashboard 
      stats={systemStats}
      recentActivity={recentActivity || []}
    />
  )
}