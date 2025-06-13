// Script to create test users via Supabase Auth API
const { createClient } = require('@supabase/supabase-js');

// Use the service role key to bypass RLS
const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

const testUsers = [
  { email: 'admin@zmf.com', password: 'password123', name: 'Admin User', role: 'admin' },
  { email: 'tony@zmf.com', password: 'password123', name: 'Tony Martinez', role: 'manager' },
  { email: 'jake@zmf.com', password: 'password123', name: 'Jake Thompson', role: 'worker', specializations: ['Sanding', 'Finishing'] },
  { email: 'sarah@zmf.com', password: 'password123', name: 'Sarah Chen', role: 'worker', specializations: ['Final Assembly', 'Acoustic QC'] },
  { email: 'mike@zmf.com', password: 'password123', name: 'Mike Rodriguez', role: 'worker', specializations: ['Intake', 'Sub-Assembly'] }
];

async function createTestUsers() {
  for (const user of testUsers) {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
        user_metadata: { full_name: user.name }
      });

      if (authError) {
        console.error(`Error creating auth user ${user.email}:`, authError);
        continue;
      }

      console.log(`Created auth user: ${user.email}`);

      // Create worker record
      const { error: workerError } = await supabase
        .from('workers')
        .insert({
          auth_user_id: authData.user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          specializations: user.specializations || []
        });

      if (workerError) {
        console.error(`Error creating worker ${user.email}:`, workerError);
      } else {
        console.log(`Created worker: ${user.email} (${user.role})`);
      }
    } catch (err) {
      console.error(`Unexpected error for ${user.email}:`, err);
    }
  }

  console.log('\nTest users created successfully!');
  console.log('\nLogin credentials:');
  testUsers.forEach(user => {
    console.log(`${user.email} / ${user.password} (${user.role})`);
  });
}

createTestUsers();