-- Create time_logs table for detailed time tracking
CREATE TABLE IF NOT EXISTS public.time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id),
  log_type TEXT NOT NULL,
  reference_type TEXT NOT NULL,
  reference_id UUID NOT NULL,
  build_id UUID REFERENCES public.builds(id),
  batch_id UUID REFERENCES public.batches(id),
  stage TEXT,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN ended_at IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (ended_at - started_at)) / 60
      ELSE NULL
    END
  ) STORED,
  is_active BOOLEAN DEFAULT TRUE,
  is_billable BOOLEAN DEFAULT TRUE,
  break_time_minutes INTEGER DEFAULT 0,
  overtime_minutes INTEGER DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_log_type CHECK (log_type IN ('work', 'break', 'meeting', 'training', 'other')),
  CONSTRAINT valid_reference_type CHECK (reference_type IN ('build', 'batch', 'order', 'general')),
  CONSTRAINT valid_stage CHECK (stage IN ('Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 'Final Assembly', 'Acoustic QC', 'Shipping', 'Rework', 'General')),
  CONSTRAINT valid_time_range CHECK (ended_at IS NULL OR ended_at > started_at)
);

-- Create time_log_breaks table for tracking break details
CREATE TABLE IF NOT EXISTS public.time_log_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_log_id UUID NOT NULL REFERENCES public.time_logs(id) ON DELETE CASCADE,
  break_type TEXT NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN ended_at IS NOT NULL THEN 
        EXTRACT(EPOCH FROM (ended_at - started_at)) / 60
      ELSE NULL
    END
  ) STORED,
  notes TEXT,
  CONSTRAINT valid_break_type CHECK (break_type IN ('lunch', 'rest', 'personal', 'other')),
  CONSTRAINT valid_break_time_range CHECK (ended_at IS NULL OR ended_at > started_at)
);

-- Create daily_time_summary table for performance
CREATE TABLE IF NOT EXISTS public.daily_time_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id),
  work_date DATE NOT NULL,
  total_hours DECIMAL(5, 2) DEFAULT 0,
  productive_hours DECIMAL(5, 2) DEFAULT 0,
  break_hours DECIMAL(5, 2) DEFAULT 0,
  overtime_hours DECIMAL(5, 2) DEFAULT 0,
  billable_hours DECIMAL(5, 2) DEFAULT 0,
  builds_worked INTEGER DEFAULT 0,
  stages_completed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(worker_id, work_date)
);

-- Create indexes
CREATE INDEX idx_time_logs_worker_id ON public.time_logs(worker_id);
CREATE INDEX idx_time_logs_build_id ON public.time_logs(build_id);
CREATE INDEX idx_time_logs_batch_id ON public.time_logs(batch_id);
CREATE INDEX idx_time_logs_started_at ON public.time_logs(started_at);
CREATE INDEX idx_time_logs_is_active ON public.time_logs(is_active);
CREATE INDEX idx_time_logs_reference ON public.time_logs(reference_type, reference_id);
CREATE INDEX idx_daily_time_summary_date ON public.daily_time_summary(work_date);
CREATE INDEX idx_daily_time_summary_worker_date ON public.daily_time_summary(worker_id, work_date);

-- Create triggers
CREATE TRIGGER update_time_logs_updated_at
  BEFORE UPDATE ON public.time_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_time_summary_updated_at
  BEFORE UPDATE ON public.daily_time_summary
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_log_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_time_summary ENABLE ROW LEVEL SECURITY;

-- RLS Policies for time_logs
CREATE POLICY "Workers can view own time logs" ON public.time_logs
  FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM public.workers
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can view all time logs" ON public.time_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workers
      WHERE workers.auth_user_id = auth.uid()
      AND workers.role IN ('manager', 'admin')
      AND workers.is_active = true
    )
  );

CREATE POLICY "Workers can create own time logs" ON public.time_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    worker_id IN (
      SELECT id FROM public.workers
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Workers can update own active time logs" ON public.time_logs
  FOR UPDATE
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM public.workers
      WHERE auth_user_id = auth.uid()
    ) AND is_active = true
  );

-- RLS Policies for time_log_breaks
CREATE POLICY "Workers can manage own break logs" ON public.time_log_breaks
  FOR ALL
  TO authenticated
  USING (
    time_log_id IN (
      SELECT id FROM public.time_logs
      WHERE worker_id IN (
        SELECT id FROM public.workers
        WHERE auth_user_id = auth.uid()
      )
    )
  );

-- RLS Policies for daily_time_summary
CREATE POLICY "Workers can view own summaries" ON public.daily_time_summary
  FOR SELECT
  TO authenticated
  USING (
    worker_id IN (
      SELECT id FROM public.workers
      WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Managers can view all summaries" ON public.daily_time_summary
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.workers
      WHERE workers.auth_user_id = auth.uid()
      AND workers.role IN ('manager', 'admin')
      AND workers.is_active = true
    )
  );

CREATE POLICY "System can manage summaries" ON public.daily_time_summary
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- Function to start time log
CREATE OR REPLACE FUNCTION start_time_log(
  p_log_type TEXT,
  p_reference_type TEXT,
  p_reference_id UUID,
  p_build_id UUID DEFAULT NULL,
  p_batch_id UUID DEFAULT NULL,
  p_stage TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_worker_id UUID;
  v_log_id UUID;
BEGIN
  -- Get worker ID
  SELECT id INTO v_worker_id
  FROM public.workers
  WHERE auth_user_id = auth.uid();
  
  -- Check for active time logs
  IF EXISTS (
    SELECT 1 FROM public.time_logs
    WHERE worker_id = v_worker_id
    AND is_active = true
    AND ended_at IS NULL
  ) THEN
    RAISE EXCEPTION 'Worker already has an active time log';
  END IF;
  
  -- Create time log
  INSERT INTO public.time_logs (
    worker_id, log_type, reference_type, reference_id,
    build_id, batch_id, stage, started_at, notes
  ) VALUES (
    v_worker_id, p_log_type, p_reference_type, p_reference_id,
    p_build_id, p_batch_id, p_stage, CURRENT_TIMESTAMP, p_notes
  ) RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to end time log
CREATE OR REPLACE FUNCTION end_time_log(
  p_log_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  v_worker_id UUID;
  v_started_at TIMESTAMP WITH TIME ZONE;
  v_work_date DATE;
BEGIN
  -- Get worker ID and validate ownership
  SELECT worker_id, started_at, DATE(started_at)
  INTO v_worker_id, v_started_at, v_work_date
  FROM public.time_logs
  WHERE id = p_log_id
  AND worker_id IN (
    SELECT id FROM public.workers
    WHERE auth_user_id = auth.uid()
  );
  
  IF v_worker_id IS NULL THEN
    RAISE EXCEPTION 'Time log not found or not owned by user';
  END IF;
  
  -- Update time log
  UPDATE public.time_logs
  SET 
    ended_at = CURRENT_TIMESTAMP,
    is_active = false,
    notes = COALESCE(p_notes, notes)
  WHERE id = p_log_id;
  
  -- Update daily summary
  PERFORM update_daily_time_summary(v_worker_id, v_work_date);
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily time summary
CREATE OR REPLACE FUNCTION update_daily_time_summary(
  p_worker_id UUID,
  p_work_date DATE
) RETURNS VOID AS $$
DECLARE
  v_total_minutes INTEGER;
  v_productive_minutes INTEGER;
  v_break_minutes INTEGER;
  v_overtime_minutes INTEGER;
  v_billable_minutes INTEGER;
  v_builds_worked INTEGER;
  v_stages_completed INTEGER;
BEGIN
  -- Calculate totals
  SELECT 
    COALESCE(SUM(duration_minutes), 0),
    COALESCE(SUM(CASE WHEN log_type = 'work' THEN duration_minutes ELSE 0 END), 0),
    COALESCE(SUM(break_time_minutes), 0),
    COALESCE(SUM(overtime_minutes), 0),
    COALESCE(SUM(CASE WHEN is_billable THEN duration_minutes ELSE 0 END), 0),
    COUNT(DISTINCT build_id),
    COUNT(DISTINCT CASE WHEN log_type = 'work' AND ended_at IS NOT NULL THEN stage END)
  INTO 
    v_total_minutes, v_productive_minutes, v_break_minutes,
    v_overtime_minutes, v_billable_minutes, v_builds_worked, v_stages_completed
  FROM public.time_logs
  WHERE worker_id = p_worker_id
  AND DATE(started_at) = p_work_date
  AND ended_at IS NOT NULL;
  
  -- Upsert daily summary
  INSERT INTO public.daily_time_summary (
    worker_id, work_date, total_hours, productive_hours,
    break_hours, overtime_hours, billable_hours,
    builds_worked, stages_completed
  ) VALUES (
    p_worker_id, p_work_date,
    v_total_minutes / 60.0,
    v_productive_minutes / 60.0,
    v_break_minutes / 60.0,
    v_overtime_minutes / 60.0,
    v_billable_minutes / 60.0,
    v_builds_worked,
    v_stages_completed
  )
  ON CONFLICT (worker_id, work_date)
  DO UPDATE SET
    total_hours = EXCLUDED.total_hours,
    productive_hours = EXCLUDED.productive_hours,
    break_hours = EXCLUDED.break_hours,
    overtime_hours = EXCLUDED.overtime_hours,
    billable_hours = EXCLUDED.billable_hours,
    builds_worked = EXCLUDED.builds_worked,
    stages_completed = EXCLUDED.stages_completed,
    updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get current active time log
CREATE OR REPLACE FUNCTION get_active_time_log()
RETURNS TABLE (
  log_id UUID,
  log_type TEXT,
  reference_type TEXT,
  reference_id UUID,
  build_id UUID,
  batch_id UUID,
  stage TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  elapsed_minutes INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id,
    time_logs.log_type,
    time_logs.reference_type,
    time_logs.reference_id,
    time_logs.build_id,
    time_logs.batch_id,
    time_logs.stage,
    time_logs.started_at,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - time_logs.started_at)) / 60 AS elapsed_minutes
  FROM public.time_logs
  WHERE worker_id IN (
    SELECT id FROM public.workers
    WHERE auth_user_id = auth.uid()
  )
  AND is_active = true
  AND ended_at IS NULL
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;