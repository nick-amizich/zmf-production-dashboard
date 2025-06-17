-- Fix RLS policies for quality_checklist_templates
-- This migration updates the RLS policies to be more explicit with both USING and WITH CHECK clauses

-- Drop existing policies
DROP POLICY IF EXISTS "Managers can manage checklist templates" ON quality_checklist_templates;
DROP POLICY IF EXISTS "Workers can view active checklist templates" ON quality_checklist_templates;

-- Create separate policies for each operation with explicit checks
CREATE POLICY "Managers can view all checklist templates" ON quality_checklist_templates
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers
      WHERE workers.auth_user_id = auth.uid()
      AND workers.is_active = true
      AND workers.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers can insert checklist templates" ON quality_checklist_templates
  FOR INSERT 
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers
      WHERE workers.auth_user_id = auth.uid()
      AND workers.is_active = true
      AND workers.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers can update checklist templates" ON quality_checklist_templates
  FOR UPDATE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers
      WHERE workers.auth_user_id = auth.uid()
      AND workers.is_active = true
      AND workers.role IN ('manager', 'admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workers
      WHERE workers.auth_user_id = auth.uid()
      AND workers.is_active = true
      AND workers.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Managers can delete checklist templates" ON quality_checklist_templates
  FOR DELETE 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workers
      WHERE workers.auth_user_id = auth.uid()
      AND workers.is_active = true
      AND workers.role IN ('manager', 'admin')
    )
  );

CREATE POLICY "Workers can view active checklist templates" ON quality_checklist_templates
  FOR SELECT 
  TO authenticated
  USING (
    is_active = true
    AND EXISTS (
      SELECT 1 FROM workers
      WHERE workers.auth_user_id = auth.uid()
      AND workers.is_active = true
    )
  );

-- Add index for better RLS performance
CREATE INDEX IF NOT EXISTS idx_workers_auth_user_id ON workers(auth_user_id);

-- Add helpful comment about the unique constraint
COMMENT ON CONSTRAINT quality_checklist_templates_model_id_stage_category_item_key ON quality_checklist_templates IS 
'Ensures no duplicate checklist items for the same model, stage, and category combination. This means each item text must be unique within its category for a given model and stage.';