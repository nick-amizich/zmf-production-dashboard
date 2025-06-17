-- Create defects table for categorized defect tracking
CREATE TABLE IF NOT EXISTS public.defects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id),
  stage TEXT NOT NULL,
  defect_category TEXT NOT NULL,
  defect_type TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'minor',
  description TEXT NOT NULL,
  root_cause TEXT,
  discovered_by UUID REFERENCES public.workers(id),
  discovered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_by UUID REFERENCES public.workers(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  time_to_resolve_minutes INTEGER,
  requires_rework BOOLEAN DEFAULT TRUE,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_stage CHECK (stage IN ('Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 'Final Assembly', 'Acoustic QC', 'Shipping')),
  CONSTRAINT valid_severity CHECK (severity IN ('minor', 'major', 'critical')),
  CONSTRAINT valid_defect_category CHECK (defect_category IN ('cosmetic', 'structural', 'acoustic', 'electrical', 'assembly', 'material', 'other'))
);

-- Create defect_types table for standardized defect classification
CREATE TABLE IF NOT EXISTS public.defect_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  defect_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  typical_stage TEXT,
  typical_severity TEXT,
  resolution_guide TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_category CHECK (category IN ('cosmetic', 'structural', 'acoustic', 'electrical', 'assembly', 'material', 'other'))
);

-- Create rework_history table
CREATE TABLE IF NOT EXISTS public.rework_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  defect_id UUID REFERENCES public.defects(id),
  rework_number INTEGER NOT NULL,
  from_stage TEXT NOT NULL,
  to_stage TEXT NOT NULL,
  reason TEXT NOT NULL,
  initiated_by UUID REFERENCES public.workers(id),
  initiated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  assigned_to UUID REFERENCES public.workers(id),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  time_spent_minutes INTEGER,
  materials_used JSONB,
  cost_estimate DECIMAL(10, 2),
  outcome TEXT,
  quality_check_passed BOOLEAN,
  quality_checked_by UUID REFERENCES public.workers(id),
  quality_checked_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  photos_before TEXT[],
  photos_after TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_from_stage CHECK (from_stage IN ('Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 'Final Assembly', 'Acoustic QC', 'Shipping')),
  CONSTRAINT valid_to_stage CHECK (to_stage IN ('Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 'Final Assembly', 'Acoustic QC', 'Shipping')),
  CONSTRAINT valid_outcome CHECK (outcome IN ('success', 'partial', 'failed', 'scrapped', 'pending'))
);

-- Create rework_queue view for active rework items
CREATE VIEW public.rework_queue AS
SELECT 
  b.id as build_id,
  b.serial_number,
  b.current_stage,
  o.order_number,
  hm.name as model_name,
  d.id as defect_id,
  d.defect_category,
  d.defect_type,
  d.severity,
  d.description as defect_description,
  rh.id as rework_id,
  rh.to_stage as target_stage,
  rh.assigned_to,
  w.name as assigned_worker_name,
  rh.initiated_at,
  rh.started_at,
  CASE 
    WHEN rh.started_at IS NULL THEN 'pending'
    WHEN rh.completed_at IS NULL THEN 'in_progress'
    ELSE 'completed'
  END as rework_status,
  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - rh.initiated_at)) / 3600 as hours_in_queue
FROM public.builds b
JOIN public.orders o ON o.id = b.order_id
JOIN public.headphone_models hm ON hm.id = o.model_id
LEFT JOIN public.defects d ON d.build_id = b.id AND d.resolved_at IS NULL
LEFT JOIN public.rework_history rh ON rh.build_id = b.id AND rh.completed_at IS NULL
LEFT JOIN public.workers w ON w.id = rh.assigned_to
WHERE b.is_rework = TRUE
  AND b.status IN ('rework', 'in_progress')
ORDER BY d.severity DESC, rh.initiated_at ASC;

-- Create indexes
CREATE INDEX idx_defects_build_id ON public.defects(build_id);
CREATE INDEX idx_defects_batch_id ON public.defects(batch_id);
CREATE INDEX idx_defects_stage ON public.defects(stage);
CREATE INDEX idx_defects_category ON public.defects(defect_category);
CREATE INDEX idx_defects_severity ON public.defects(severity);
CREATE INDEX idx_defects_unresolved ON public.defects(resolved_at) WHERE resolved_at IS NULL;
CREATE INDEX idx_defect_types_category ON public.defect_types(category);
CREATE INDEX idx_defect_types_code ON public.defect_types(defect_code);
CREATE INDEX idx_rework_history_build_id ON public.rework_history(build_id);
CREATE INDEX idx_rework_history_defect_id ON public.rework_history(defect_id);
CREATE INDEX idx_rework_history_assigned_to ON public.rework_history(assigned_to);
CREATE INDEX idx_rework_history_incomplete ON public.rework_history(completed_at) WHERE completed_at IS NULL;

-- Create triggers
CREATE TRIGGER update_defects_updated_at
  BEFORE UPDATE ON public.defects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rework_history_updated_at
  BEFORE UPDATE ON public.rework_history
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.defect_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rework_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for defects
CREATE POLICY "Workers can view defects" ON public.defects
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Workers can report defects" ON public.defects
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Workers can update defects" ON public.defects
  FOR UPDATE
  TO authenticated
  USING (TRUE);

-- RLS Policies for defect_types
CREATE POLICY "Workers can view defect types" ON public.defect_types
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Managers can manage defect types" ON public.defect_types
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workers
      WHERE workers.auth_user_id = auth.uid()
      AND workers.role IN ('manager', 'admin')
      AND workers.is_active = true
    )
  );

-- RLS Policies for rework_history
CREATE POLICY "Workers can view rework history" ON public.rework_history
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Workers can create rework entries" ON public.rework_history
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Assigned workers can update rework" ON public.rework_history
  FOR UPDATE
  TO authenticated
  USING (
    assigned_to IN (
      SELECT id FROM public.workers
      WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.workers
      WHERE workers.auth_user_id = auth.uid()
      AND workers.role IN ('manager', 'admin')
      AND workers.is_active = true
    )
  );

-- Function to report defect and initiate rework
CREATE OR REPLACE FUNCTION report_defect_and_rework(
  p_build_id UUID,
  p_stage TEXT,
  p_defect_category TEXT,
  p_defect_type TEXT,
  p_severity TEXT,
  p_description TEXT,
  p_target_stage TEXT,
  p_photos TEXT[] DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_defect_id UUID;
  v_rework_id UUID;
  v_worker_id UUID;
  v_build_stage TEXT;
  v_batch_id UUID;
BEGIN
  -- Get worker ID
  SELECT id INTO v_worker_id
  FROM public.workers
  WHERE auth_user_id = auth.uid();
  
  -- Get build info
  SELECT current_stage, batch_id INTO v_build_stage, v_batch_id
  FROM public.builds
  WHERE id = p_build_id;
  
  -- Create defect record
  INSERT INTO public.defects (
    build_id, batch_id, stage, defect_category, defect_type,
    severity, description, discovered_by, photos, requires_rework
  ) VALUES (
    p_build_id, v_batch_id, p_stage, p_defect_category, p_defect_type,
    p_severity, p_description, v_worker_id, p_photos, TRUE
  ) RETURNING id INTO v_defect_id;
  
  -- Update build status
  UPDATE public.builds
  SET 
    status = 'rework',
    is_rework = TRUE,
    quality_status = CASE 
      WHEN p_severity = 'critical' THEN 'critical'
      WHEN p_severity = 'major' THEN 'warning'
      ELSE quality_status
    END
  WHERE id = p_build_id;
  
  -- Create rework entry
  INSERT INTO public.rework_history (
    build_id, defect_id, rework_number, from_stage, to_stage,
    reason, initiated_by
  ) VALUES (
    p_build_id, v_defect_id, 
    (SELECT COALESCE(MAX(rework_number), 0) + 1 FROM public.rework_history WHERE build_id = p_build_id),
    v_build_stage, p_target_stage,
    p_defect_category || ': ' || p_description,
    v_worker_id
  ) RETURNING id INTO v_rework_id;
  
  -- Transition build stage
  PERFORM transition_build_stage(p_build_id, 'Rework', 'Defect reported: ' || p_description);
  
  RETURN v_defect_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to complete rework
CREATE OR REPLACE FUNCTION complete_rework(
  p_rework_id UUID,
  p_outcome TEXT,
  p_quality_passed BOOLEAN,
  p_notes TEXT DEFAULT NULL,
  p_photos_after TEXT[] DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_worker_id UUID;
  v_build_id UUID;
  v_defect_id UUID;
  v_target_stage TEXT;
  v_time_spent INTEGER;
BEGIN
  -- Get worker ID
  SELECT id INTO v_worker_id
  FROM public.workers
  WHERE auth_user_id = auth.uid();
  
  -- Get rework info
  SELECT build_id, defect_id, to_stage, 
         EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - COALESCE(started_at, initiated_at))) / 60
  INTO v_build_id, v_defect_id, v_target_stage, v_time_spent
  FROM public.rework_history
  WHERE id = p_rework_id;
  
  -- Update rework history
  UPDATE public.rework_history
  SET 
    completed_at = CURRENT_TIMESTAMP,
    time_spent_minutes = v_time_spent,
    outcome = p_outcome,
    quality_check_passed = p_quality_passed,
    quality_checked_by = v_worker_id,
    quality_checked_at = CURRENT_TIMESTAMP,
    notes = p_notes,
    photos_after = p_photos_after
  WHERE id = p_rework_id;
  
  -- If successful, resolve defect and update build
  IF p_outcome = 'success' AND p_quality_passed THEN
    -- Resolve defect
    UPDATE public.defects
    SET 
      resolved_by = v_worker_id,
      resolved_at = CURRENT_TIMESTAMP,
      resolution_notes = 'Rework completed successfully',
      time_to_resolve_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - discovered_at)) / 60
    WHERE id = v_defect_id;
    
    -- Update build
    UPDATE public.builds
    SET 
      status = 'in_progress',
      is_rework = FALSE,
      current_stage = v_target_stage,
      quality_status = 'good'
    WHERE id = v_build_id;
    
    -- Transition build stage
    PERFORM transition_build_stage(v_build_id, v_target_stage, 'Rework completed successfully');
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get defect statistics
CREATE OR REPLACE FUNCTION get_defect_statistics(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
) RETURNS TABLE (
  defect_category TEXT,
  defect_count INTEGER,
  avg_resolution_time_hours DECIMAL,
  critical_count INTEGER,
  major_count INTEGER,
  minor_count INTEGER,
  rework_success_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    d.defect_category,
    COUNT(*)::INTEGER as defect_count,
    AVG(d.time_to_resolve_minutes) / 60 as avg_resolution_time_hours,
    COUNT(*) FILTER (WHERE d.severity = 'critical')::INTEGER as critical_count,
    COUNT(*) FILTER (WHERE d.severity = 'major')::INTEGER as major_count,
    COUNT(*) FILTER (WHERE d.severity = 'minor')::INTEGER as minor_count,
    (COUNT(*) FILTER (WHERE rh.outcome = 'success' AND rh.quality_check_passed = true)::DECIMAL / 
     NULLIF(COUNT(*) FILTER (WHERE rh.outcome IS NOT NULL), 0) * 100) as rework_success_rate
  FROM public.defects d
  LEFT JOIN public.rework_history rh ON rh.defect_id = d.id
  WHERE d.discovered_at BETWEEN p_start_date AND p_end_date
  GROUP BY d.defect_category
  ORDER BY defect_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert common defect types
INSERT INTO public.defect_types (category, defect_code, name, description, typical_stage, typical_severity, resolution_guide) VALUES
-- Cosmetic defects
('cosmetic', 'COS-001', 'Scratch', 'Visible scratch on wood surface', 'Sanding', 'minor', 'Light sanding and refinishing required'),
('cosmetic', 'COS-002', 'Dent', 'Dent or impression in wood', 'Sanding', 'major', 'Fill with wood filler, sand, and refinish'),
('cosmetic', 'COS-003', 'Finish Defect', 'Uneven or flawed finish', 'Finishing', 'minor', 'Sand lightly and reapply finish'),
('cosmetic', 'COS-004', 'Color Mismatch', 'Wood color does not match specification', 'Finishing', 'major', 'Strip and refinish with correct stain'),
-- Structural defects
('structural', 'STR-001', 'Crack', 'Crack in wood structure', 'Any', 'critical', 'Assess severity; may require replacement'),
('structural', 'STR-002', 'Misalignment', 'Components do not align properly', 'Assembly', 'major', 'Disassemble and realign components'),
('structural', 'STR-003', 'Loose Joint', 'Joint is not secure', 'Assembly', 'major', 'Reglue and clamp joint'),
-- Acoustic defects
('acoustic', 'ACO-001', 'Driver Rattle', 'Driver produces rattling sound', 'Acoustic QC', 'critical', 'Check driver mounting and damping'),
('acoustic', 'ACO-002', 'Air Leak', 'Unwanted air leak affecting sound', 'Acoustic QC', 'critical', 'Locate and seal leak'),
('acoustic', 'ACO-003', 'Frequency Response', 'Does not meet frequency response spec', 'Acoustic QC', 'major', 'Check driver and acoustic damping'),
-- Electrical defects
('electrical', 'ELE-001', 'No Signal', 'No audio signal passing through', 'Final Assembly', 'critical', 'Check all connections and solder joints'),
('electrical', 'ELE-002', 'Intermittent Connection', 'Audio cuts in and out', 'Final Assembly', 'major', 'Resolder connections'),
('electrical', 'ELE-003', 'Channel Imbalance', 'Left/right channels unbalanced', 'Acoustic QC', 'major', 'Check wiring and driver matching'),
-- Assembly defects
('assembly', 'ASM-001', 'Missing Component', 'Required component not installed', 'Assembly', 'major', 'Install missing component'),
('assembly', 'ASM-002', 'Wrong Component', 'Incorrect component installed', 'Assembly', 'major', 'Replace with correct component'),
('assembly', 'ASM-003', 'Poor Fitment', 'Components do not fit properly', 'Assembly', 'minor', 'Adjust or modify for proper fit'),
-- Material defects
('material', 'MAT-001', 'Wood Defect', 'Natural defect in wood', 'Intake', 'varies', 'Assess if defect affects structure or appearance'),
('material', 'MAT-002', 'Wrong Wood Type', 'Incorrect wood species used', 'Intake', 'critical', 'Replace with correct wood type'),
('material', 'MAT-003', 'Damaged Component', 'Component damaged before assembly', 'Intake', 'major', 'Replace damaged component')
ON CONFLICT (defect_code) DO NOTHING;