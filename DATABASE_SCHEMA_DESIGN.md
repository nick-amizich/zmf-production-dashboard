# ZMF Production Dashboard - Database Schema Design

## Overview

This document provides the complete database schema design for the ZMF Production Dashboard, optimized for performance, data integrity, and scalability.

## Schema Design Principles

1. **Normalization**: 3NF where appropriate, denormalized for performance
2. **Type Safety**: Strong typing with enums and constraints
3. **Referential Integrity**: Foreign keys with appropriate cascade rules
4. **Performance**: Strategic indexes and materialized views
5. **Audit Trail**: Timestamps and history tracking
6. **Row Level Security**: Mandatory on all tables

## Core Enums

```sql
-- Production stages in order
CREATE TYPE production_stage AS ENUM (
  'Intake',
  'Sanding', 
  'Finishing',
  'Sub-Assembly',
  'Final Assembly',
  'Acoustic QC',
  'Shipping'
);

-- Quality status levels
CREATE TYPE quality_status AS ENUM (
  'good',      -- Passes all checks
  'warning',   -- Minor issues, can proceed
  'critical',  -- Major issues, needs attention
  'hold'       -- Stop production
);

-- Worker roles
CREATE TYPE worker_role AS ENUM (
  'worker',    -- Production worker
  'manager',   -- Production manager
  'admin'      -- System administrator
);

-- Order/Batch priorities
CREATE TYPE batch_priority AS ENUM (
  'standard',  -- Normal production
  'rush',      -- Expedited
  'expedite'   -- Highest priority
);

-- Order status
CREATE TYPE order_status AS ENUM (
  'pending',       -- Not started
  'in_production', -- Active production
  'completed',     -- Production complete
  'shipped',       -- Sent to customer
  'on_hold'        -- Paused
);

-- Wood types
CREATE TYPE wood_type AS ENUM (
  'Sapele',
  'Cherry',
  'Walnut',
  'Ash',
  'Maple',
  'Cocobolo',
  'Katalox',
  'Ziricote',
  'Blackwood'
);

-- Model complexity
CREATE TYPE model_complexity AS ENUM (
  'medium',
  'high',
  'very_high'
);
```

## Core Tables

### 1. User Management

```sql
-- Workers/Employees table
CREATE TABLE workers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role worker_role NOT NULL DEFAULT 'worker',
  is_active BOOLEAN DEFAULT true,
  specializations production_stage[] DEFAULT '{}',
  hire_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT unique_auth_user UNIQUE(auth_user_id)
);

CREATE INDEX idx_workers_auth_user_id ON workers(auth_user_id);
CREATE INDEX idx_workers_email ON workers(email);
CREATE INDEX idx_workers_role ON workers(role) WHERE is_active = true;
CREATE INDEX idx_workers_specializations ON workers USING GIN(specializations);
```

### 2. Product Management

```sql
-- Headphone models
CREATE TABLE headphone_models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sku_prefix TEXT NOT NULL UNIQUE,
  complexity model_complexity NOT NULL,
  base_production_hours DECIMAL(4,2) NOT NULL CHECK (base_production_hours > 0),
  wood_types wood_type[] NOT NULL CHECK (array_length(wood_types, 1) > 0),
  base_price DECIMAL(10,2) NOT NULL CHECK (base_price > 0),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_models_active ON headphone_models(is_active);
CREATE INDEX idx_models_wood_types ON headphone_models USING GIN(wood_types);

-- Model-specific production stages
CREATE TABLE model_production_stages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  model_id UUID REFERENCES headphone_models(id) ON DELETE CASCADE,
  stage production_stage NOT NULL,
  estimated_hours DECIMAL(4,2) NOT NULL CHECK (estimated_hours > 0),
  quality_checklist JSONB NOT NULL DEFAULT '[]',
  display_order INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_model_stage UNIQUE(model_id, stage)
);

CREATE INDEX idx_model_stages ON model_production_stages(model_id, display_order);
```

### 3. Customer & Order Management

```sql
-- Customers
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shopify_customer_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_shopify_id ON customers(shopify_customer_id) WHERE shopify_customer_id IS NOT NULL;

-- Orders
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  shopify_order_id TEXT UNIQUE,
  customer_id UUID REFERENCES customers(id),
  model_id UUID REFERENCES headphone_models(id) NOT NULL,
  wood_type wood_type NOT NULL,
  customizations JSONB DEFAULT '{}',
  notes TEXT,
  internal_notes TEXT,
  status order_status DEFAULT 'pending',
  priority batch_priority DEFAULT 'standard',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure wood type is valid for model
  CONSTRAINT valid_wood_type CHECK (
    wood_type IN (
      SELECT unnest(wood_types) 
      FROM headphone_models 
      WHERE id = model_id
    )
  )
);

CREATE INDEX idx_orders_status ON orders(status) WHERE status != 'shipped';
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_model ON orders(model_id);
CREATE INDEX idx_orders_due_date ON orders(due_date) WHERE status IN ('pending', 'in_production');
CREATE INDEX idx_orders_created ON orders(created_at DESC);

-- Order status history
CREATE TABLE order_status_history (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  old_status order_status,
  new_status order_status NOT NULL,
  changed_by UUID REFERENCES workers(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_history ON order_status_history(order_id, created_at DESC);
```

### 4. Production Management

```sql
-- Production batches
CREATE TABLE batches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_number TEXT UNIQUE NOT NULL,
  priority batch_priority DEFAULT 'standard',
  current_stage production_stage DEFAULT 'Intake',
  quality_status quality_status DEFAULT 'good',
  is_complete BOOLEAN DEFAULT false,
  target_completion DATE,
  actual_completion DATE,
  created_by UUID REFERENCES workers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_batches_active ON batches(is_complete, current_stage) WHERE is_complete = false;
CREATE INDEX idx_batches_priority ON batches(priority, created_at) WHERE is_complete = false;

-- Batch-Order relationship
CREATE TABLE batch_orders (
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  added_by UUID REFERENCES workers(id),
  
  PRIMARY KEY (batch_id, order_id)
);

CREATE INDEX idx_batch_orders_order ON batch_orders(order_id);

-- Ensure orders aren't in multiple active batches
CREATE UNIQUE INDEX idx_single_active_batch ON batch_orders(order_id)
WHERE EXISTS (
  SELECT 1 FROM batches 
  WHERE batches.id = batch_orders.batch_id 
  AND NOT batches.is_complete
);

-- Stage assignments
CREATE TABLE stage_assignments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  batch_id UUID REFERENCES batches(id),
  stage production_stage NOT NULL,
  assigned_worker_id UUID REFERENCES workers(id),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  quality_status quality_status,
  time_spent_minutes INTEGER GENERATED ALWAYS AS (
    EXTRACT(EPOCH FROM (completed_at - started_at)) / 60
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_batch_stage UNIQUE(batch_id, stage)
);

CREATE INDEX idx_assignments_batch ON stage_assignments(batch_id);
CREATE INDEX idx_assignments_worker ON stage_assignments(assigned_worker_id);
CREATE INDEX idx_assignments_active ON stage_assignments(completed_at) WHERE completed_at IS NULL;
```

### 5. Quality Control

```sql
-- Quality checklist templates
CREATE TABLE quality_checklist_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  model_id UUID REFERENCES headphone_models(id),
  stage production_stage NOT NULL,
  version INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES workers(id),
  
  CONSTRAINT unique_active_template UNIQUE(model_id, stage) WHERE is_active = true
);

-- Checklist items
CREATE TABLE quality_checklist_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  template_id UUID REFERENCES quality_checklist_templates(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  item_text TEXT NOT NULL,
  severity quality_status NOT NULL DEFAULT 'warning',
  is_required BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL,
  help_text TEXT,
  photo_required BOOLEAN DEFAULT false
);

CREATE INDEX idx_checklist_items ON quality_checklist_items(template_id, display_order);

-- Quality checks
CREATE TABLE quality_checks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  batch_id UUID REFERENCES batches(id),
  stage production_stage NOT NULL,
  worker_id UUID REFERENCES workers(id),
  template_id UUID REFERENCES quality_checklist_templates(id),
  overall_status quality_status NOT NULL,
  duration_minutes INTEGER,
  photos TEXT[] DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  
  CONSTRAINT unique_order_stage_check UNIQUE(order_id, stage)
);

CREATE INDEX idx_checks_order ON quality_checks(order_id);
CREATE INDEX idx_checks_batch ON quality_checks(batch_id);
CREATE INDEX idx_checks_worker ON quality_checks(worker_id);
CREATE INDEX idx_checks_status ON quality_checks(overall_status) WHERE overall_status != 'good';

-- Individual check results
CREATE TABLE quality_check_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quality_check_id UUID REFERENCES quality_checks(id) ON DELETE CASCADE,
  checklist_item_id UUID REFERENCES quality_checklist_items(id),
  passed BOOLEAN NOT NULL,
  notes TEXT,
  photo_urls TEXT[]
);

CREATE INDEX idx_check_results ON quality_check_results(quality_check_id);
```

### 6. Issue Tracking

```sql
-- Issue categories
CREATE TABLE issue_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  default_severity quality_status NOT NULL,
  sla_hours INTEGER,
  is_active BOOLEAN DEFAULT true
);

-- Issues
CREATE TABLE issues (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id),
  batch_id UUID REFERENCES batches(id),
  stage production_stage NOT NULL,
  category_id UUID REFERENCES issue_categories(id),
  reported_by UUID REFERENCES workers(id),
  assigned_to UUID REFERENCES workers(id),
  severity quality_status NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  root_cause TEXT,
  resolution_notes TEXT,
  photo_urls TEXT[],
  is_resolved BOOLEAN DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES workers(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  due_at TIMESTAMPTZ GENERATED ALWAYS AS (
    created_at + (
      SELECT sla_hours || ' hours'::INTERVAL 
      FROM issue_categories 
      WHERE id = category_id
    )
  ) STORED
);

CREATE INDEX idx_issues_open ON issues(is_resolved, severity) WHERE is_resolved = false;
CREATE INDEX idx_issues_order ON issues(order_id);
CREATE INDEX idx_issues_assigned ON issues(assigned_to) WHERE is_resolved = false;
CREATE INDEX idx_issues_due ON issues(due_at) WHERE is_resolved = false;
```

### 7. Performance Tracking

```sql
-- Production metrics
CREATE TABLE production_metrics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id),
  stage production_stage NOT NULL,
  model_id UUID REFERENCES headphone_models(id),
  date DATE NOT NULL,
  units_completed INTEGER DEFAULT 0,
  total_time_minutes INTEGER DEFAULT 0,
  quality_pass_rate DECIMAL(5,2) CHECK (quality_pass_rate BETWEEN 0 AND 100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT unique_worker_stage_date UNIQUE(worker_id, stage, model_id, date)
);

CREATE INDEX idx_metrics_worker_date ON production_metrics(worker_id, date DESC);
CREATE INDEX idx_metrics_date ON production_metrics(date DESC);

-- Worker availability
CREATE TABLE worker_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  worker_id UUID REFERENCES workers(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  available_hours DECIMAL(3,1) DEFAULT 8.0 CHECK (available_hours BETWEEN 0 AND 24),
  assigned_hours DECIMAL(3,1) DEFAULT 0.0 CHECK (assigned_hours BETWEEN 0 AND 24),
  notes TEXT,
  
  CONSTRAINT unique_worker_date UNIQUE(worker_id, date),
  CONSTRAINT valid_hours CHECK (assigned_hours <= available_hours)
);

CREATE INDEX idx_availability_date ON worker_availability(date, worker_id);
```

### 8. External Integrations

```sql
-- Product configurations for Shopify
CREATE TABLE product_configurations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shopify_product_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  base_price DECIMAL(10,2) NOT NULL,
  base_sku TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_config_active ON product_configurations(active, shopify_product_id);

-- Product options
CREATE TABLE product_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  configuration_id UUID REFERENCES product_configurations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('variant', 'property')),
  required BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_product_options ON product_options(configuration_id, display_order);

-- Option values
CREATE TABLE option_values (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  option_id UUID REFERENCES product_options(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price_modifier DECIMAL(10,2) DEFAULT 0,
  sku TEXT,
  available BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_option_values ON option_values(option_id, available);

-- API logs
CREATE TABLE shopify_api_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  endpoint TEXT NOT NULL,
  product_id TEXT,
  shopify_domain TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_api_logs_date ON shopify_api_logs(created_at DESC);
CREATE INDEX idx_api_logs_product ON shopify_api_logs(product_id, created_at DESC);
```

### 9. System Logging

```sql
-- System logs
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

CREATE INDEX idx_logs_user ON system_logs(user_id, created_at DESC);
CREATE INDEX idx_logs_date ON system_logs(created_at DESC);
CREATE INDEX idx_logs_action ON system_logs(action, created_at DESC);
```

## Materialized Views

```sql
-- Production summary view
CREATE MATERIALIZED VIEW production_summary AS
SELECT 
  b.id as batch_id,
  b.batch_number,
  b.current_stage,
  b.priority,
  b.quality_status,
  COUNT(DISTINCT bo.order_id) as order_count,
  COUNT(DISTINCT o.model_id) as model_count,
  array_agg(DISTINCT hm.name) as models,
  SUM(hm.base_production_hours) as total_estimated_hours,
  COUNT(DISTINCT sa.assigned_worker_id) as workers_assigned,
  MIN(o.due_date) as earliest_due_date
FROM batches b
JOIN batch_orders bo ON b.id = bo.batch_id
JOIN orders o ON bo.order_id = o.id
JOIN headphone_models hm ON o.model_id = hm.id
LEFT JOIN stage_assignments sa ON b.id = sa.batch_id
WHERE b.is_complete = false
GROUP BY b.id, b.batch_number, b.current_stage, b.priority, b.quality_status;

CREATE UNIQUE INDEX idx_production_summary ON production_summary(batch_id);

-- Quality metrics view
CREATE MATERIALIZED VIEW quality_metrics_summary AS
SELECT 
  DATE_TRUNC('day', qc.created_at) as date,
  qc.stage,
  COUNT(*) as total_checks,
  COUNT(CASE WHEN qc.overall_status = 'good' THEN 1 END) as passed,
  COUNT(CASE WHEN qc.overall_status != 'good' THEN 1 END) as failed,
  ROUND(AVG(CASE WHEN qc.overall_status = 'good' THEN 100 ELSE 0 END), 2) as pass_rate,
  AVG(qc.duration_minutes) as avg_duration
FROM quality_checks qc
WHERE qc.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', qc.created_at), qc.stage;

CREATE INDEX idx_quality_summary ON quality_metrics_summary(date DESC, stage);
```

## Helper Functions

```sql
-- Update timestamp trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  
-- ... apply to all relevant tables

-- Generate batch number
CREATE OR REPLACE FUNCTION generate_batch_number()
RETURNS TEXT AS $$
DECLARE
  today_count INTEGER;
  batch_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO today_count
  FROM batches
  WHERE DATE(created_at) = CURRENT_DATE;
  
  batch_number := 'B' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(today_count::TEXT, 3, '0');
  
  RETURN batch_number;
END;
$$ LANGUAGE plpgsql;

-- Calculate SLA status
CREATE OR REPLACE FUNCTION get_sla_status(
  created_at TIMESTAMPTZ,
  due_at TIMESTAMPTZ,
  is_resolved BOOLEAN
)
RETURNS TEXT AS $$
BEGIN
  IF is_resolved THEN
    RETURN 'resolved';
  ELSIF NOW() > due_at THEN
    RETURN 'overdue';
  ELSIF NOW() > due_at - INTERVAL '1 hour' THEN
    RETURN 'at_risk';
  ELSE
    RETURN 'on_track';
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

## Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE issues ENABLE ROW LEVEL SECURITY;
-- ... enable for all tables

-- Worker policies
CREATE POLICY "Workers view own profile" ON workers
  FOR SELECT TO authenticated
  USING (auth_user_id = auth.uid());

CREATE POLICY "Managers view all workers" ON workers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.auth_user_id = auth.uid()
      AND w.role IN ('manager', 'admin')
    )
  );

-- Order policies
CREATE POLICY "Workers view all orders" ON orders
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Managers modify orders" ON orders
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers w
      WHERE w.auth_user_id = auth.uid()
      AND w.role IN ('manager', 'admin')
    )
  );

-- Quality check policies
CREATE POLICY "Workers create own checks" ON quality_checks
  FOR INSERT TO authenticated
  WITH CHECK (
    worker_id = (
      SELECT id FROM workers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "All view quality checks" ON quality_checks
  FOR SELECT TO authenticated
  USING (true);

-- Issue policies
CREATE POLICY "Workers create issues" ON issues
  FOR INSERT TO authenticated
  WITH CHECK (
    reported_by = (
      SELECT id FROM workers WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Workers update assigned issues" ON issues
  FOR UPDATE TO authenticated
  USING (
    assigned_to = (
      SELECT id FROM workers WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM workers w
      WHERE w.auth_user_id = auth.uid()
      AND w.role IN ('manager', 'admin')
    )
  );
```

## Performance Optimization

1. **Partial Indexes**: For frequently filtered queries
2. **Covering Indexes**: Include all needed columns
3. **Materialized Views**: For complex aggregations
4. **Table Partitioning**: For large historical data
5. **Connection Pooling**: Via Supabase
6. **Query Optimization**: EXPLAIN ANALYZE on slow queries

## Backup and Recovery

1. **Point-in-time recovery**: Enabled via Supabase
2. **Daily backups**: Automated
3. **Logical backups**: For specific tables
4. **Replication**: Read replicas for reporting

## Monitoring

1. **Query performance**: pg_stat_statements
2. **Table bloat**: Regular VACUUM
3. **Index usage**: pg_stat_user_indexes
4. **Connection count**: Monitor pooler
5. **Storage growth**: Track table sizes