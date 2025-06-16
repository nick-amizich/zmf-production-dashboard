-- Add RLS policies for customers table
-- Allow all authenticated workers to view customers
CREATE POLICY "Workers can view all customers" ON customers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Allow managers and admins to create customers
CREATE POLICY "Managers can create customers" ON customers
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  );

-- Allow managers and admins to update customers
CREATE POLICY "Managers can update customers" ON customers
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  );

-- Allow managers and admins to delete customers
CREATE POLICY "Managers can delete customers" ON customers
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  );

-- Add RLS policies for headphone_models table (also missing)
CREATE POLICY "Workers can view headphone models" ON headphone_models
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  );

-- Add RLS policies for batch_orders table (also missing)
CREATE POLICY "Workers can view batch orders" ON batch_orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Managers can manage batch orders" ON batch_orders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  );

-- Add RLS policies for orders table
CREATE POLICY "Workers can view orders" ON orders
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Managers can create orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  );

-- Add RLS policies for batches table
CREATE POLICY "Workers can view batches" ON batches
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
    )
  );

CREATE POLICY "Managers can create batches" ON batches
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers can update batches" ON batches
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND is_active = true
      AND role IN ('manager', 'admin')
    )
  );