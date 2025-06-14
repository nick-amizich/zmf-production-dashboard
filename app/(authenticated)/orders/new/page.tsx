import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BatchOrderCreator from '@/components/batch-order-creator'

export default async function NewOrderPage() {
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Create New Order</h1>
        <BatchOrderCreator />
      </div>
    </div>
  )
}