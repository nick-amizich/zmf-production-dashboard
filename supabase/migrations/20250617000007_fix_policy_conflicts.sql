-- Drop conflicting policies if they exist
DROP POLICY IF EXISTS "Managers can create orders" ON orders;
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Workers can view customers for orders" ON customers;