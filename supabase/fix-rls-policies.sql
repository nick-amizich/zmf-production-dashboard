-- Fix RLS policies for workers table
-- First, drop existing policies
DROP POLICY IF EXISTS "Users can read their own worker record" ON workers;
DROP POLICY IF EXISTS "Managers can read all workers" ON workers;
DROP POLICY IF EXISTS "Only admins can insert workers" ON workers;
DROP POLICY IF EXISTS "Only admins can update workers" ON workers;

-- Create new, more permissive policies for development
-- Allow authenticated users to read their own worker record
CREATE POLICY "Users can view their own worker record" ON workers
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Allow all authenticated users to see all workers (for development)
CREATE POLICY "Authenticated users can view all workers" ON workers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow service role to do everything
CREATE POLICY "Service role can do everything" ON workers
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'workers';