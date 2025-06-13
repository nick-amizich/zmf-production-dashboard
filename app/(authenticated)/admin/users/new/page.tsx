import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewUserForm } from '@/components/admin/new-user-form'

export default async function NewUserPage() {
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
  
  return <NewUserForm />
}