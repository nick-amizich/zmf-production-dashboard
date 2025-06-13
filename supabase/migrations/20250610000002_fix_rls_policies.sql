-- Fix infinite recursion in RLS policies
-- The issue is that policies on workers table reference workers table itself

-- Drop the problematic policies
DROP POLICY IF EXISTS "Only managers can manage workers" ON workers;
DROP POLICY IF EXISTS "Only managers can create/update orders" ON orders;
DROP POLICY IF EXISTS "Only managers can update orders" ON orders;
DROP POLICY IF EXISTS "Only managers can manage batches" ON batches;
DROP POLICY IF EXISTS "Managers can manage all assignments" ON stage_assignments;
DROP POLICY IF EXISTS "Workers can update assigned issues" ON issues;
DROP POLICY IF EXISTS "Workers can create issues" ON issues;
DROP POLICY IF EXISTS "Only managers can view logs" ON system_logs;
DROP POLICY IF EXISTS "Workers can update their own assignments" ON stage_assignments;

-- Create a helper function to check user role without causing recursion
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS worker_role AS $$
DECLARE
  user_role worker_role;
BEGIN
  SELECT role INTO user_role
  FROM workers
  WHERE auth_user_id = auth.uid();
  
  RETURN COALESCE(user_role, 'worker'::worker_role);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate policies using the helper function

-- Workers table policies (fixed)
CREATE POLICY "Managers can manage workers" ON workers
  FOR ALL TO authenticated
  USING (get_user_role() IN ('manager', 'admin'));

-- Orders table policies (fixed)
CREATE POLICY "Managers can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (get_user_role() IN ('manager', 'admin'));

CREATE POLICY "Managers can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (get_user_role() IN ('manager', 'admin'));

-- Batches table policies (fixed)
CREATE POLICY "Managers can manage batches" ON batches
  FOR ALL TO authenticated
  USING (get_user_role() IN ('manager', 'admin'));

-- Stage assignments policies (fixed)
CREATE POLICY "Workers can update own assignments" ON stage_assignments
  FOR UPDATE TO authenticated
  USING (
    assigned_worker_id = (
      SELECT id FROM workers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can manage assignments" ON stage_assignments
  FOR ALL TO authenticated
  USING (get_user_role() IN ('manager', 'admin'));

-- Issues policies (fixed)
CREATE POLICY "Workers can create issues" ON issues
  FOR INSERT TO authenticated
  WITH CHECK (
    reported_by = (
      SELECT id FROM workers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Workers can update assigned issues" ON issues
  FOR UPDATE TO authenticated
  USING (
    assigned_to = (
      SELECT id FROM workers WHERE auth_user_id = auth.uid()
    )
    OR get_user_role() IN ('manager', 'admin')
  );

-- System logs policies (fixed)
CREATE POLICY "Managers can view logs" ON system_logs
  FOR SELECT TO authenticated
  USING (get_user_role() IN ('manager', 'admin')); 