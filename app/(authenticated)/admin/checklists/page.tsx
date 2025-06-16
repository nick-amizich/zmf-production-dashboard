import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ChecklistManager } from '@/components/admin/checklist-manager'

export default async function ChecklistsPage() {
  const supabase = await createClient()
  
  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  
  // Get worker profile and verify manager role
  const { data: worker } = await supabase
    .from('workers')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (!worker || !worker.is_active || !['manager', 'admin'].includes(worker.role)) {
    redirect('/dashboard')
  }
  
  // Get all headphone models
  const { data: models } = await supabase
    .from('headphone_models')
    .select('*')
    .order('name')
  
  // Get all checklist templates
  const { data: templates } = await supabase
    .from('quality_checklist_templates')
    .select('*')
    .order('stage', { ascending: true })
    .order('sort_order', { ascending: true })
  
  return (
    <div className="min-h-screen bg-theme-bg-primary">
      <main className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-theme-text-primary">Quality Checklist Management</h1>
          <p className="text-theme-text-secondary mt-2">
            Configure quality control checklists for each production stage and headphone model
          </p>
        </div>
        
        <ChecklistManager 
          models={models || []} 
          templates={templates || []}
          userId={worker.id}
        />
      </main>
    </div>
  )
}