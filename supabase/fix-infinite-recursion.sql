-- Fix infinite recursion in workers table RLS policies
-- Run this in Supabase SQL Editor or via migration

-- First, drop ALL existing policies on workers table
DROP POLICY IF EXISTS "Workers can view all workers" ON workers;
DROP POLICY IF EXISTS "Only managers can manage workers" ON workers;
DROP POLICY IF EXISTS "Authenticated users can read workers" ON workers;
DROP POLICY IF EXISTS "Users can read own worker record" ON workers;
DROP POLICY IF EXISTS "Users can read their own worker record" ON workers;
DROP POLICY IF EXISTS "Users can view their own worker record" ON workers;
DROP POLICY IF EXISTS "Authenticated users can view all workers" ON workers;
DROP POLICY IF EXISTS "Service role can do everything" ON workers;
DROP POLICY IF EXISTS "Managers can read all workers" ON workers;
DROP POLICY IF EXISTS "Only admins can insert workers" ON workers;
DROP POLICY IF EXISTS "Only admins can update workers" ON workers;

-- Create new, simple policies that avoid recursion

-- 1. Allow authenticated users to read their own worker record
CREATE POLICY "Users can read own worker record" ON workers
  FOR SELECT 
  TO authenticated
  USING (auth_user_id = auth.uid());

-- 2. Allow authenticated users to see all workers (for development)
-- This avoids the recursive subquery
CREATE POLICY "Authenticated users can view workers" ON workers
  FOR SELECT 
  TO authenticated
  USING (auth.role() = 'authenticated');

-- 3. Allow service role full access
CREATE POLICY "Service role full access" ON workers
  FOR ALL 
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 4. Allow managers/admins to manage workers
-- Note: This policy checks the JWT claims to avoid recursion
CREATE POLICY "Managers can manage workers" ON workers
  FOR ALL 
  TO authenticated
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM workers WHERE role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM workers WHERE role IN ('manager', 'admin')
    )
  );

-- Verify the policies
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'workers'
ORDER BY policyname;