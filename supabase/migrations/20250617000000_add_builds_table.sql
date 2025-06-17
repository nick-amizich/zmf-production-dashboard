-- Create builds table for tracking individual headphone units
CREATE TABLE IF NOT EXISTS public.builds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number TEXT UNIQUE NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  headphone_model_id UUID REFERENCES public.headphone_models(id),
  model_code TEXT,
  batch_id UUID REFERENCES public.batches(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.workers(id),
  current_stage TEXT NOT NULL DEFAULT 'intake',
  status TEXT NOT NULL DEFAULT 'pending',
  quality_status TEXT DEFAULT 'good',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  target_completion_date DATE,
  notes TEXT,
  is_rework BOOLEAN DEFAULT FALSE,
  rework_count INTEGER DEFAULT 0,
  priority INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_stage CHECK (current_stage IN ('intake', 'sanding', 'finishing', 'sub_assembly', 'final_assembly', 'acoustic_qc', 'shipping', 'completed', 'on_hold', 'rework')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold', 'rework', 'cancelled')),
  CONSTRAINT valid_quality CHECK (quality_status IN ('good', 'warning', 'critical', 'hold', 'fail'))
);

-- Create indexes for performance
CREATE INDEX idx_builds_order_id ON public.builds(order_id);
CREATE INDEX idx_builds_batch_id ON public.builds(batch_id);
CREATE INDEX idx_builds_current_stage ON public.builds(current_stage);
CREATE INDEX idx_builds_status ON public.builds(status);
CREATE INDEX idx_builds_serial_number ON public.builds(serial_number);
CREATE INDEX idx_builds_assigned_to ON public.builds(assigned_to);

-- Create function to generate serial numbers
CREATE OR REPLACE FUNCTION generate_serial_number(model_code TEXT) 
RETURNS TEXT AS $$
DECLARE
  year_code TEXT;
  sequence_num INTEGER;
  serial TEXT;
BEGIN
  -- Get year code (last 2 digits of year)
  year_code := TO_CHAR(CURRENT_DATE, 'YY');
  
  -- Get next sequence number for this year and model
  SELECT COUNT(*) + 1 INTO sequence_num
  FROM public.builds
  WHERE serial_number LIKE model_code || '-' || year_code || '-%';
  
  -- Format: MODEL-YY-XXXXX (e.g., ATT-24-00001)
  serial := model_code || '-' || year_code || '-' || LPAD(sequence_num::TEXT, 5, '0');
  
  RETURN serial;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at
CREATE TRIGGER update_builds_updated_at
  BEFORE UPDATE ON public.builds
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create build_stage_history table to track stage transitions
CREATE TABLE IF NOT EXISTS public.build_stage_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE,
  performed_by UUID REFERENCES public.workers(id),
  notes TEXT,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN completed_at IS NOT NULL 
      THEN EXTRACT(EPOCH FROM (completed_at - started_at)) / 60
      ELSE NULL
    END::INTEGER
  ) STORED
);

CREATE INDEX idx_build_stage_history_build_id ON public.build_stage_history(build_id);
CREATE INDEX idx_build_stage_history_started_at ON public.build_stage_history(started_at);

-- Enable RLS
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_stage_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for builds
CREATE POLICY "Workers can view builds" ON public.builds
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Managers can manage builds" ON public.builds
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

CREATE POLICY "Workers can update assigned builds" ON public.builds
  FOR UPDATE
  TO authenticated
  USING (
    assigned_to IN (
      SELECT id FROM public.workers
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  )
  WITH CHECK (
    assigned_to IN (
      SELECT id FROM public.workers
      WHERE auth_user_id = auth.uid()
      AND is_active = true
    )
  );

-- RLS Policies for build_stage_history
CREATE POLICY "Workers can view build history" ON public.build_stage_history
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "System can insert build history" ON public.build_stage_history
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);