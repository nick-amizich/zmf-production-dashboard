import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InventoryClient from './client-page'

export default async function InventoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: worker } = await supabase
    .from('workers')
    .select('id, role, is_active')
    .eq('auth_user_id', user.id)
    .single()

  if (!worker?.is_active || !['manager', 'admin'].includes(worker.role)) {
    redirect('/unauthorized')
  }

  return <InventoryClient />
}