# Core Database & Data Models Module - Implementation Plan

## Module Overview

The Core Database module establishes the foundation data structure, relationships, and access patterns for the entire system. This module ensures data integrity, performance, and type safety across all operations.

## Dependencies

### External Dependencies
- Supabase PostgreSQL
- @supabase/postgrest-js
- TypeScript

### Internal Dependencies
- Authentication Module (for RLS policies)

## Enhanced Database Schema

### Core Business Entities

#### 1. Headphone Models
```sql
CREATE TABLE headphone_models (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  sku_prefix TEXT NOT NULL UNIQUE,
  complexity model_complexity NOT NULL,
  base_production_hours DECIMAL(4,2) NOT NULL,
  wood_types wood_type[] NOT NULL DEFAULT '{}',
  base_price DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add production stages specific to each model
CREATE TABLE model_production_stages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  model_id UUID REFERENCES headphone_models(id) ON DELETE CASCADE,
  stage production_stage NOT NULL,
  estimated_hours DECIMAL(4,2) NOT NULL,
  quality_checklist JSONB NOT NULL DEFAULT '[]',
  display_order INTEGER NOT NULL,
  UNIQUE(model_id, stage)
);
```

#### 2. Enhanced Orders System
```sql
-- Customer information
CREATE TABLE customers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  shopify_customer_id TEXT UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  shipping_address JSONB,
  billing_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders with full tracking
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  shopify_order_id TEXT UNIQUE,
  customer_id UUID REFERENCES customers(id),
  model_id UUID REFERENCES headphone_models(id),
  wood_type wood_type NOT NULL,
  customizations JSONB DEFAULT '{}',
  notes TEXT,
  internal_notes TEXT, -- Staff only
  status order_status DEFAULT 'pending',
  priority batch_priority DEFAULT 'standard',
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
```

#### 3. Enhanced Batch Management
```sql
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

-- Batch metadata
CREATE TABLE batch_metadata (
  batch_id UUID REFERENCES batches(id) ON DELETE CASCADE PRIMARY KEY,
  total_estimated_hours DECIMAL(6,2),
  actual_hours_spent DECIMAL(6,2),
  defect_rate DECIMAL(5,2),
  notes TEXT,
  tags TEXT[] DEFAULT '{}'
);
```

### Data Integrity Constraints

#### 1. Business Rules as Constraints
```sql
-- Ensure orders can't be in multiple active batches
CREATE UNIQUE INDEX idx_active_batch_orders ON batch_orders(order_id)
WHERE EXISTS (
  SELECT 1 FROM batches 
  WHERE batches.id = batch_orders.batch_id 
  AND NOT batches.is_complete
);

-- Ensure stage progression is valid
CREATE OR REPLACE FUNCTION validate_stage_progression()
RETURNS TRIGGER AS $$
BEGIN
  -- Logic to ensure stages progress in correct order
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_stage_progression
  BEFORE UPDATE ON batches
  FOR EACH ROW
  WHEN (OLD.current_stage IS DISTINCT FROM NEW.current_stage)
  EXECUTE FUNCTION validate_stage_progression();
```

#### 2. Data Validation Functions
```sql
-- Validate wood type for model
CREATE OR REPLACE FUNCTION validate_order_wood_type()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM headphone_models
    WHERE id = NEW.model_id
    AND NEW.wood_type = ANY(wood_types)
  ) THEN
    RAISE EXCEPTION 'Invalid wood type for this model';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_order_wood_type
  BEFORE INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION validate_order_wood_type();
```

### Performance Optimization

#### 1. Strategic Indexes
```sql
-- Foreign key indexes (automatic in Postgres, but explicit for clarity)
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_model_id ON orders(model_id);
CREATE INDEX idx_batch_orders_batch_id ON batch_orders(batch_id);
CREATE INDEX idx_batch_orders_order_id ON batch_orders(order_id);

-- Query performance indexes
CREATE INDEX idx_orders_status_priority ON orders(status, priority);
CREATE INDEX idx_batches_stage_status ON batches(current_stage, is_complete);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

-- Full text search
CREATE INDEX idx_customers_search ON customers USING gin(
  to_tsvector('english', name || ' ' || COALESCE(email, ''))
);
```

#### 2. Materialized Views for Reports
```sql
CREATE MATERIALIZED VIEW production_summary AS
SELECT 
  b.id as batch_id,
  b.batch_number,
  b.current_stage,
  COUNT(DISTINCT bo.order_id) as order_count,
  array_agg(DISTINCT o.model_id) as models,
  SUM(hm.base_production_hours) as estimated_hours
FROM batches b
JOIN batch_orders bo ON b.id = bo.batch_id
JOIN orders o ON bo.order_id = o.id
JOIN headphone_models hm ON o.model_id = hm.id
GROUP BY b.id, b.batch_number, b.current_stage;

-- Refresh strategy
CREATE OR REPLACE FUNCTION refresh_production_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY production_summary;
END;
$$ LANGUAGE plpgsql;
```

### Type Safety Implementation

#### 1. Generate TypeScript Types
```bash
# Script to generate types
npx supabase gen types typescript --project-id kjdicpudxqxenhjwdrzg > types/database.types.ts
```

#### 2. Type-Safe Query Builder
```typescript
// lib/database/query-builder.ts
import { Database } from '@/types/database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export class QueryBuilder {
  constructor(private supabase: SupabaseClient<Database>) {}

  orders() {
    return this.supabase
      .from('orders')
      .select(`
        *,
        customer:customers(*),
        model:headphone_models(*),
        batch_orders!inner(
          batch:batches(*)
        )
      `)
  }

  batches() {
    return this.supabase
      .from('batches')
      .select(`
        *,
        batch_orders(
          order:orders(
            *,
            model:headphone_models(*)
          )
        ),
        created_by:workers(name)
      `)
  }
}
```

### Data Access Layer

#### 1. Repository Pattern
```typescript
// lib/database/repositories/order-repository.ts
export class OrderRepository {
  constructor(private db: SupabaseClient<Database>) {}

  async findById(id: string) {
    const { data, error } = await this.db
      .from('orders')
      .select('*, customer:customers(*), model:headphone_models(*)')
      .eq('id', id)
      .single()

    if (error) throw new DatabaseError('Failed to fetch order', error)
    return data
  }

  async create(order: InsertOrder) {
    const { data, error } = await this.db
      .from('orders')
      .insert(order)
      .select()
      .single()

    if (error) throw new DatabaseError('Failed to create order', error)
    return data
  }

  async updateStatus(id: string, status: OrderStatus, userId: string) {
    // Start transaction
    const { data: order } = await this.findById(id)
    
    // Update order
    const { error: updateError } = await this.db
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (updateError) throw updateError

    // Log status change
    await this.db
      .from('order_status_history')
      .insert({
        order_id: id,
        old_status: order.status,
        new_status: status,
        changed_by: userId
      })
  }
}
```

### Migration Strategy

#### 1. Migration Files
```sql
-- migrations/001_initial_schema.sql
-- Core tables and types

-- migrations/002_add_indexes.sql
-- Performance indexes

-- migrations/003_add_constraints.sql
-- Business rule constraints

-- migrations/004_add_views.sql
-- Materialized views and functions
```

#### 2. Seed Data
```sql
-- migrations/seed.sql
INSERT INTO headphone_models (name, sku_prefix, complexity, base_production_hours, wood_types, base_price) VALUES
  ('Atticus', 'ATT', 'medium', 6.0, ARRAY['Sapele', 'Cherry', 'Walnut']::wood_type[], 499.00),
  ('Eikon', 'EIK', 'medium', 8.0, ARRAY['Sapele', 'Cherry', 'Walnut']::wood_type[], 599.00),
  ('Verite', 'VER', 'high', 10.0, ARRAY['Sapele', 'Cherry', 'Walnut', 'Cocobolo']::wood_type[], 2499.00),
  ('Auteur', 'AUT', 'high', 12.0, ARRAY['Sapele', 'Cherry', 'Walnut', 'Cocobolo']::wood_type[], 2499.00),
  ('Caldera', 'CAL', 'very_high', 14.0, ARRAY['Sapele', 'Cherry', 'Walnut', 'Cocobolo', 'Ziricote']::wood_type[], 3499.00);

-- Model production stages
INSERT INTO model_production_stages (model_id, stage, estimated_hours, display_order) 
SELECT 
  hm.id,
  stage.name,
  CASE 
    WHEN stage.name = 'Intake' THEN 0.5
    WHEN stage.name = 'Sanding' THEN 2.0
    WHEN stage.name = 'Finishing' THEN 1.5
    WHEN stage.name = 'Sub-Assembly' THEN 2.0
    WHEN stage.name = 'Final Assembly' THEN 2.5
    WHEN stage.name = 'Acoustic QC' THEN 1.0
    WHEN stage.name = 'Shipping' THEN 0.5
  END,
  stage.ord
FROM headphone_models hm
CROSS JOIN (
  SELECT unnest(enum_range(NULL::production_stage)) as name,
         row_number() OVER () as ord
) stage;
```

### Testing Strategy

#### 1. Database Tests
```sql
-- Use pgTAP for database testing
BEGIN;
SELECT plan(10);

-- Test constraints
SELECT throws_ok(
  'INSERT INTO orders (model_id, wood_type) VALUES (uuid_generate_v4(), ''InvalidWood'')',
  '23514',
  'new row for relation "orders" violates check constraint'
);

-- Test triggers
SELECT lives_ok(
  'INSERT INTO orders (order_number, model_id, wood_type) VALUES (''TEST001'', (SELECT id FROM headphone_models LIMIT 1), ''Sapele'')'
);

SELECT finish();
ROLLBACK;
```

#### 2. Integration Tests
```typescript
// tests/database/order-repository.test.ts
describe('OrderRepository', () => {
  it('should create order with valid data', async () => {
    const order = await repository.create({
      order_number: 'TEST001',
      model_id: modelId,
      wood_type: 'Sapele'
    })
    
    expect(order).toBeDefined()
    expect(order.status).toBe('pending')
  })

  it('should fail with invalid wood type', async () => {
    await expect(repository.create({
      order_number: 'TEST002',
      model_id: modelId,
      wood_type: 'InvalidWood'
    })).rejects.toThrow()
  })
})
```

### Monitoring & Maintenance

1. **Query Performance**: Monitor slow queries
2. **Table Sizes**: Track growth rates
3. **Index Usage**: Ensure indexes are being used
4. **Constraint Violations**: Log and alert
5. **Data Quality**: Regular validation checks

### Success Metrics

- Query response time < 100ms for 95% of queries
- Zero data integrity violations
- 100% type coverage in TypeScript
- Successful migration with zero downtime
- All business rules enforced at database level