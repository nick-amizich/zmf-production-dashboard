const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const demoUsers = [
  { email: 'admin@zmf.com', name: 'System Admin', role: 'admin' },
  { email: 'manager@zmf.com', name: 'Production Manager', role: 'manager' },
  { email: 'sarah@zmf.com', name: 'Sarah Johnson', role: 'worker' },
  { email: 'mike@zmf.com', name: 'Mike Chen', role: 'worker' }
]

async function createDemoUsers() {
  console.log('Creating demo users...')
  
  for (const user of demoUsers) {
    try {
      console.log(`Creating user: ${user.email}`)
      
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: 'password123',
        email_confirm: true
      })
      
      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError.message)
        continue
      }
      
      console.log(`✓ Auth user created: ${user.email}`)
      
      // Create worker record
      const { data: workerData, error: workerError } = await supabase
        .from('workers')
        .insert({
          auth_user_id: authData.user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          is_active: true,
          specializations: user.role === 'worker' ? ['Intake', 'Sanding'] : []
        })
      
      if (workerError) {
        console.error(`Error creating worker record for ${user.email}:`, workerError.message)
      } else {
        console.log(`✓ Worker record created: ${user.name}`)
      }
      
    } catch (error) {
      console.error(`Unexpected error for ${user.email}:`, error.message)
    }
  }
  
  console.log('\nDemo users creation completed!')
  console.log('You can now login with:')
  demoUsers.forEach(user => {
    console.log(`  ${user.email} / password123 (${user.role})`)
  })
}

createDemoUsers().catch(console.error) 