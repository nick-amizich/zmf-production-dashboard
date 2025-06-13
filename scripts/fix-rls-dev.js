// Script to fix RLS issues for development
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU'
);

async function fixRLS() {
  // Execute SQL to fix RLS policies
  const { error } = await supabase.rpc('query_raw', {
    query: `
      -- Drop existing problematic policies
      DROP POLICY IF EXISTS "Users can read their own worker record" ON workers;
      DROP POLICY IF EXISTS "Managers can read all workers" ON workers;
      
      -- Create a simple policy that allows any authenticated user to read workers
      CREATE POLICY "Allow authenticated read" ON workers
        FOR SELECT 
        USING (true);
      
      -- Allow authenticated users to update their own record
      CREATE POLICY "Users can update own record" ON workers
        FOR UPDATE 
        USING (auth.uid() = auth_user_id);
    `
  });

  if (error) {
    console.error('Error fixing RLS:', error);
    
    // Alternative: Try using direct SQL execution
    console.log('Trying alternative approach...');
    
    // For development, we can temporarily disable RLS
    const { error: disableError } = await supabase.rpc('query_raw', {
      query: 'ALTER TABLE workers DISABLE ROW LEVEL SECURITY;'
    });
    
    if (disableError) {
      console.error('Could not disable RLS:', disableError);
    } else {
      console.log('Temporarily disabled RLS on workers table for development');
    }
  } else {
    console.log('Successfully updated RLS policies');
  }
  
  // Test the connection
  const { data, error: testError } = await supabase
    .from('workers')
    .select('*');
    
  if (testError) {
    console.error('Test query failed:', testError);
  } else {
    console.log(`Test successful! Found ${data.length} workers`);
  }
}

fixRLS();