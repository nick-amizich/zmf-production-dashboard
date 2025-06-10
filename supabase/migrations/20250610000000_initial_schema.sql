-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE production_stage AS ENUM (
  'Intake',
  'Sanding',
  'Finishing',
  'Sub-Assembly',
  'Final Assembly',
  'Acoustic QC',
  'Shipping'
);

CREATE TYPE quality_status AS ENUM ('good', 'warning', 'critical', 'hold');
CREATE TYPE batch_priority AS ENUM ('standard', 'rush', 'expedite');
CREATE TYPE worker_role AS ENUM ('worker', 'manager', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'in_production', 'completed', 'shipped', 'on_hold');
CREATE TYPE wood_type AS ENUM (
  'Sapele', 'Cherry', 'Walnut', 'Ash', 'Maple',
  'Cocobolo', 'Katalox', 'Ziricote', 'Blackwood'
);
CREATE TYPE model_complexity AS ENUM ('medium', 'high', 'very_high');

-- Create workers table
CREATE TABLE workers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role worker_role NOT NULL DEFAULT 'worker',
  is_active BOOLEAN DEFAULT true,
  specializations production_stage[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create headphone models table
CREATE TABLE headphone_models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  complexity model_complexity NOT NULL,
  base_production_hours DECIMAL(4,2) NOT NULL,
  wood_types wood_type[] NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create customers table
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shopify_customer_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  shopify_order_id TEXT UNIQUE,
  customer_id UUID REFERENCES customers(id),
  model_id UUID REFERENCES headphone_models(id),
  wood_type wood_type NOT NULL,
  customizations JSONB DEFAULT '{}',
  notes TEXT,
  status order_status DEFAULT 'pending',
  priority batch_priority DEFAULT 'standard',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create batches table
CREATE TABLE batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_number TEXT UNIQUE NOT NULL,
  priority batch_priority DEFAULT 'standard',
  current_stage production_stage DEFAULT 'Intake',
  quality_status quality_status DEFAULT 'good',
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create batch_orders junction table
CREATE TABLE batch_orders (
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  PRIMARY KEY (batch_id, order_id)
);

-- Create stage_assignments table
CREATE TABLE stage_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES batches(id),
  stage production_stage NOT NULL,
  assigned_worker_id UUID REFERENCES workers(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  quality_status quality_status,
  time_spent_minutes INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create quality_checks table
CREATE TABLE quality_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  batch_id UUID REFERENCES batches(id),
  stage production_stage NOT NULL,
  worker_id UUID REFERENCES workers(id),
  checklist_data JSONB NOT NULL DEFAULT '[]',
  overall_status quality_status NOT NULL,
  photos TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create issues table
CREATE TABLE issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  batch_id UUID REFERENCES batches(id),
  stage production_stage NOT NULL,
  reported_by UUID REFERENCES workers(id),
  assigned_to UUID REFERENCES workers(id),
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  severity quality_status NOT NULL,
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES workers(id),
  resolution_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create production_metrics table
CREATE TABLE production_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id),
  stage production_stage NOT NULL,
  model_id UUID REFERENCES headphone_models(id),
  date DATE NOT NULL,
  units_completed INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  quality_pass_rate DECIMAL(5,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(worker_id, stage, model_id, date)
);

-- Create system_logs table
CREATE TABLE system_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES workers(id),
  action TEXT NOT NULL,
  context TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create storage bucket for quality photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('quality-photos', 'quality-photos', false);

-- Enable RLS on all tables
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE headphone_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE batch_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE stage_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_workers_auth_user_id ON workers(auth_user_id);
CREATE INDEX idx_workers_email ON workers(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_batches_current_stage ON batches(current_stage);
CREATE INDEX idx_stage_assignments_batch_id ON stage_assignments(batch_id);
CREATE INDEX idx_stage_assignments_worker_id ON stage_assignments(assigned_worker_id);
CREATE INDEX idx_quality_checks_order_id ON quality_checks(order_id);
CREATE INDEX idx_issues_order_id ON issues(order_id);
CREATE INDEX idx_issues_assigned_to ON issues(assigned_to);
CREATE INDEX idx_production_metrics_worker_date ON production_metrics(worker_id, date);

-- Create RLS policies

-- Workers table policies
CREATE POLICY "Workers can view all workers" ON workers
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only managers can manage workers" ON workers
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers
      WHERE auth_user_id = (SELECT auth.uid())
      AND role IN ('manager', 'admin')
    )
  );

-- Orders table policies
CREATE POLICY "Workers can view all orders" ON orders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only managers can create/update orders" ON orders
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers
      WHERE auth_user_id = (SELECT auth.uid())
      AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Only managers can update orders" ON orders
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers
      WHERE auth_user_id = (SELECT auth.uid())
      AND role IN ('manager', 'admin')
    )
  );

-- Batches table policies
CREATE POLICY "Workers can view all batches" ON batches
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Only managers can manage batches" ON batches
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers
      WHERE auth_user_id = (SELECT auth.uid())
      AND role IN ('manager', 'admin')
    )
  );

-- Stage assignments policies
CREATE POLICY "Workers can view assignments" ON stage_assignments
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Workers can update their own assignments" ON stage_assignments
  FOR UPDATE TO authenticated
  USING (
    assigned_worker_id = (
      SELECT id FROM workers WHERE auth_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Managers can manage all assignments" ON stage_assignments
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers
      WHERE auth_user_id = (SELECT auth.uid())
      AND role IN ('manager', 'admin')
    )
  );

-- Quality checks policies
CREATE POLICY "Workers can view quality checks" ON quality_checks
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Workers can create quality checks" ON quality_checks
  FOR INSERT TO authenticated
  WITH CHECK (
    worker_id = (
      SELECT id FROM workers WHERE auth_user_id = (SELECT auth.uid())
    )
  );

-- Issues policies
CREATE POLICY "Workers can view all issues" ON issues
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Workers can create issues" ON issues
  FOR INSERT TO authenticated
  WITH CHECK (
    reported_by = (
      SELECT id FROM workers WHERE auth_user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "Workers can update assigned issues" ON issues
  FOR UPDATE TO authenticated
  USING (
    assigned_to = (
      SELECT id FROM workers WHERE auth_user_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM workers
      WHERE auth_user_id = (SELECT auth.uid())
      AND role IN ('manager', 'admin')
    )
  );

-- Production metrics policies
CREATE POLICY "Workers can view metrics" ON production_metrics
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "System can manage metrics" ON production_metrics
  FOR ALL TO authenticated
  USING (true);

-- System logs policies
CREATE POLICY "Only managers can view logs" ON system_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers
      WHERE auth_user_id = (SELECT auth.uid())
      AND role IN ('manager', 'admin')
    )
  );

CREATE POLICY "System can create logs" ON system_logs
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Storage policies for quality photos
CREATE POLICY "Workers can upload quality photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'quality-photos' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Workers can view quality photos" ON storage.objects
  FOR SELECT TO authenticated
  USING (
    bucket_id = 'quality-photos' AND
    auth.role() = 'authenticated'
  );

-- Helper functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Insert initial data
INSERT INTO headphone_models (name, complexity, base_production_hours, wood_types) VALUES
  ('Atticus', 'medium', 6.0, ARRAY['Sapele', 'Cherry', 'Walnut', 'Ash', 'Maple']::wood_type[]),
  ('Eikon', 'medium', 8.0, ARRAY['Sapele', 'Cherry', 'Walnut', 'Ash', 'Maple']::wood_type[]),
  ('Verite', 'high', 10.0, ARRAY['Sapele', 'Cherry', 'Walnut', 'Ash', 'Maple', 'Cocobolo', 'Katalox', 'Ziricote', 'Blackwood']::wood_type[]),
  ('Auteur', 'high', 12.0, ARRAY['Sapele', 'Cherry', 'Walnut', 'Ash', 'Maple', 'Cocobolo', 'Katalox', 'Ziricote', 'Blackwood']::wood_type[]),
  ('Caldera', 'very_high', 14.0, ARRAY['Sapele', 'Cherry', 'Walnut', 'Ash', 'Maple', 'Cocobolo', 'Katalox', 'Ziricote', 'Blackwood']::wood_type[]),
  ('Atrium', 'very_high', 16.0, ARRAY['Sapele', 'Cherry', 'Walnut', 'Ash', 'Maple', 'Cocobolo', 'Katalox', 'Ziricote', 'Blackwood']::wood_type[]);