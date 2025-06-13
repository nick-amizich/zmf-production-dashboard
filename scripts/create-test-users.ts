const { createClient } = require('@supabase/supabase-js')

// This script creates test users for local development
// Run with: npx tsx scripts/create-test-users.ts

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

interface TestUser {
  email: string
  password: string
  name: string
  role: 'worker' | 'manager' | 'admin'
  specializations: string[]
}

const testUsers: TestUser[] = [
  {
    email: 'admin@zmf.com',
    password: 'password123',
    name: 'Admin User',
    role: 'admin',
    specializations: ['Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 'Final Assembly', 'Acoustic QC', 'Shipping'],
  },
  {
    email: 'tony@zmf.com',
    password: 'password123',
    name: 'Tony Martinez',
    role: 'manager',
    specializations: ['Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 'Final Assembly', 'Acoustic QC', 'Shipping'],
  },
  {
    email: 'sarah@zmf.com',
    password: 'password123',
    name: 'Sarah Chen',
    role: 'worker',
    specializations: ['Sanding', 'Finishing'],
  },
  {
    email: 'mike@zmf.com',
    password: 'password123',
    name: 'Mike Johnson',
    role: 'worker',
    specializations: ['Sub-Assembly', 'Final Assembly'],
  },
  {
    email: 'jake@zmf.com',
    password: 'password123',
    name: 'Jake Thompson',
    role: 'worker',
    specializations: ['Acoustic QC', 'Shipping'],
  },
]

async function createTestUsers() {
  console.log('Creating test users...')
  
  for (const testUser of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: testUser.email,
        password: testUser.password,
        email_confirm: true,
        user_metadata: {
          full_name: testUser.name,
        },
      })
      
      if (authError) {
        console.error(`Error creating auth user ${testUser.email}:`, authError.message)
        continue
      }
      
      if (!authData.user) {
        console.error(`No user data returned for ${testUser.email}`)
        continue
      }
      
      // Create worker record
      const { error: workerError } = await supabase
        .from('workers')
        .insert({
          auth_user_id: authData.user.id,
          email: testUser.email,
          name: testUser.name,
          role: testUser.role,
          specializations: testUser.specializations,
          is_active: true,
        })
      
      if (workerError) {
        console.error(`Error creating worker record for ${testUser.email}:`, workerError.message)
        continue
      }
      
      console.log(`✅ Created user: ${testUser.email} (${testUser.role})`)
    } catch (error) {
      console.error(`Error creating user ${testUser.email}:`, error)
    }
  }
  
  console.log('\nTest users created successfully!')
  console.log('\nYou can now log in with:')
  testUsers.forEach(user => {
    console.log(`  ${user.email} - ${user.role}`)
  })
  console.log('  Password for all users: password123')
}

createTestUsers().catch(console.error)