// Script to fix worker-auth user links
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function fixWorkerAuthLinks() {
  // Get all auth users
  const { data: authUsers } = await supabase.auth.admin.listUsers();
  
  console.log('Auth users found:');
  authUsers.users.forEach(user => {
    console.log(`- ${user.email} (ID: ${user.id})`);
  });

  // Update worker records to link to existing auth users
  for (const authUser of authUsers.users) {
    const { data: worker, error } = await supabase
      .from('workers')
      .update({ auth_user_id: authUser.id })
      .eq('email', authUser.email)
      .select()
      .single();

    if (error) {
      console.log(`No worker found for ${authUser.email}, creating one...`);
      
      // Determine role based on email
      let role = 'worker';
      if (authUser.email === 'admin@zmf.com') role = 'admin';
      else if (authUser.email === 'tony@zmf.com') role = 'manager';
      
      // Create worker record
      const { error: createError } = await supabase
        .from('workers')
        .insert({
          auth_user_id: authUser.id,
          name: authUser.user_metadata?.full_name || authUser.email.split('@')[0],
          email: authUser.email,
          role: role
        });
        
      if (createError) {
        console.error(`Error creating worker for ${authUser.email}:`, createError);
      } else {
        console.log(`Created worker for ${authUser.email} with role: ${role}`);
      }
    } else {
      console.log(`Updated worker ${worker.email} to link with auth user ${authUser.id}`);
    }
  }

  // Verify the fix
  console.log('\n\nVerifying worker-auth links:');
  const { data: workers } = await supabase
    .from('workers')
    .select('*')
    .not('auth_user_id', 'is', null);

  for (const worker of workers) {
    console.log(`✓ ${worker.email} (${worker.role}) linked to auth_user_id: ${worker.auth_user_id}`);
  }
}

fixWorkerAuthLinks();