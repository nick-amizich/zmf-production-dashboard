import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AnalyticsService } from '@/lib/services/analytics-service'
import { AnalyticsDashboard } from '@/components/analytics/analytics-dashboard'
import { startOfMonth, endOfMonth, subDays } from 'date-fns'

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string; end?: string; period?: string }>
}) {
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
  
  // Await searchParams in Next.js 15
  const params = await searchParams
  
  // Parse date range from query params or use defaults
  const period = params.period || 'month'
  let startDate: Date
  let endDate: Date
  
  if (params.start && params.end) {
    startDate = new Date(params.start)
    endDate = new Date(params.end)
  } else if (period === 'month') {
    startDate = startOfMonth(new Date())
    endDate = endOfMonth(new Date())
  } else {
    endDate = new Date()
    startDate = subDays(endDate, parseInt(period))
  }
  
  // Get analytics data
  const analyticsService = new AnalyticsService(supabase)
  const analytics = await analyticsService.getDashboardAnalytics(startDate, endDate)
  
  return (
    <AnalyticsDashboard 
      data={analytics}
      initialPeriod={period}
    />
  )
}