import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProductionPipeline } from '@/components/production/production-pipeline'
import { ProductionHeader } from '@/components/production/production-header'
import { ProductionService } from '@/lib/services/production-service'

export default async function ProductionPage() {
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
  
  // Get production data
  const productionService = new ProductionService(supabase)
  const pipeline = await productionService.getProductionPipeline()
  
  // Get pending orders for batch creation
  const { data: pendingOrders } = await supabase
    .from('orders')
    .select(`
      *,
      customer:customers(*),
      model:headphone_models(*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: true })
  
  return (
    <div className="min-h-screen bg-theme-bg-primary">
      <ProductionHeader 
        worker={worker}
        pendingOrders={pendingOrders || []}
      />
      
      <main className="p-6">
        <ProductionPipeline 
          pipeline={pipeline}
          userRole={worker.role}
          userId={worker.id}
        />
      </main>
    </div>
  )
}