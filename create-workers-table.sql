-- Simple workers table creation
-- Run this in your Supabase SQL editor

-- Create workers table
CREATE TABLE IF NOT EXISTS workers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  auth_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'admin',
  specializations text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_workers_auth_user ON workers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_workers_email ON workers(email);

-- Enable RLS
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;

-- Simple RLS policy - allow all authenticated users to read
CREATE POLICY "Authenticated users can read workers" ON workers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow users to read their own record
CREATE POLICY "Users can read own worker record" ON workers
  FOR SELECT USING (auth.uid() = auth_user_id);

-- Insert a worker record for any existing auth users
-- This creates admin workers for all existing users
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