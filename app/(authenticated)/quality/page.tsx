import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { QualityDashboard } from '@/components/quality/quality-dashboard'
import { QualityService } from '@/lib/services/quality-service'

export default async function QualityPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Get worker profile
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!worker || !worker.is_active) redirect('/login')
  
  // Get quality data
  const qualityService = new QualityService(supabase)
  const dashboardData = await qualityService.getQualityDashboard()
  
  // Get active batches for quality checks
  const { data: activeBatches } = await supabase
    .from('batches')
    .select(`
      *,
      batch_orders(
        order:orders(
          *,
          customer:customers(*),
          model:headphone_models(*)
        )
      )
    `)
    .eq('is_complete', false)
    .order('created_at', { ascending: false })
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-theme-text-primary">Quality Control</h1>
        <p className="text-theme-text-secondary mt-2">
          Monitor quality checks and manage issues across production
        </p>
      </div>
      
      <QualityDashboard 
        data={dashboardData}
        activeBatches={activeBatches || []}
        userRole={worker.role}
        userId={worker.id}
      />
    </div>
  )
}