import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProductionCalendarClient from './client-page'

export default async function ProductionCalendarPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: employee, error } = await supabase
    .from('workers')
    .select('id, role, is_active, name, email')
    .eq('auth_user_id', user.id)
    .single()

  if (error || !employee) {
    redirect('/login')
  }

  if (!employee.is_active) {
    redirect('/login')
  }

  if (employee.role !== 'manager' && employee.role !== 'admin') {
    redirect('/dashboard')
  }

  return <ProductionCalendarClient />
}