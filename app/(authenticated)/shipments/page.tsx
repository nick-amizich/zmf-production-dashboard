import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ShipmentsClient from './client-page'

export default async function ShipmentsPage() {
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

  if (!worker?.is_active) {
    redirect('/unauthorized')
  }

  return <ShipmentsClient workerId={worker.id} userRole={worker.role} />
}