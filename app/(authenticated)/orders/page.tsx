import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrderManagement from '@/components/orders/order-management'

export default async function OrdersPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Get worker/employee
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!worker || !['admin', 'manager'].includes(worker.role)) {
    redirect('/dashboard')
  }
  
  return (
    <div className="min-h-screen bg-background">
      <OrderManagement />
    </div>
  )
}