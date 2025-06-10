-- Create production stages enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE production_stage AS ENUM (
    'Intake',
    'Sanding',
    'Pre-finishing',
    'Finishing',
    'Assembly',
    'Quality Control',
    'Final Assembly',
    'Shipping'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('worker', 'manager', 'admin')),
  specializations production_stage[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workers_auth_user ON workers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);
CREATE INDEX IF NOT EXISTS idx_workers_role ON workers(role);

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read their own worker record" ON workers
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Managers can read all workers" ON workers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Only admins can insert workers" ON workers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update workers" ON workers
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM workers 
      WHERE auth_user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE
  ON workers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert a worker record for any existing auth users (for testing)
-- This will create admin workers for all existing users
INSERT INTO workers (auth_user_id, name, email, role)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', email),
  email,
  'admin'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM workers WHERE workers.auth_user_id = auth.users.id
);