const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuth() {
  console.log('Testing authentication with demo users...\n')
  
  const testUsers = [
    { email: 'admin@zmf.com', password: 'password123' },
    { email: 'sarah@zmf.com', password: 'password123' }
  ]
  
  for (const user of testUsers) {
    try {
      console.log(`Testing login for: ${user.email}`)
      
      // Test sign in
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })
      
      if (authError) {
        console.error(`❌ Login failed for ${user.email}:`, authError.message)
        continue
      }
      
      console.log(`✓ Login successful for: ${user.email}`)
      
      // Test worker record lookup
      const { data: worker, error: workerError } = await supabase
        .from('workers')
        .select('name, role, is_active')
        .eq('auth_user_id', authData.user.id)
        .single()
      
      if (workerError) {
        console.error(`❌ Worker lookup failed for ${user.email}:`, workerError.message)
      } else {
        console.log(`✓ Worker record found: ${worker.name} (${worker.role})`)
      }
      
      // Sign out
      await supabase.auth.signOut()
      console.log(`✓ Signed out: ${user.email}\n`)
      
    } catch (error) {
      console.error(`❌ Unexpected error for ${user.email}:`, error.message)
    }
  }
  
  console.log('Authentication test completed!')
}

testAuth().catch(console.error) 