-- Add trigger to automatically create builds when orders are created
CREATE OR REPLACE FUNCTION auto_create_builds_for_order()
RETURNS TRIGGER AS $$
DECLARE
  v_model_code TEXT;
  v_serial_number TEXT;
BEGIN
  -- Get model code (first 3 letters of model name)
  SELECT UPPER(LEFT(hm.name, 3)) INTO v_model_code
  FROM public.headphone_models hm
  WHERE hm.id = NEW.model_id;
  
  -- Generate serial number
  v_serial_number := generate_serial_number(v_model_code);
  
  -- Insert build
  INSERT INTO public.builds (
    serial_number, order_id, headphone_model_id, model_code, current_stage, status, priority
  ) VALUES (
    v_serial_number, NEW.id, NEW.model_id, v_model_code, 'intake', 'pending', 3
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_builds_on_order_insert
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_builds_for_order();

-- Update batches table to add completion tracking
ALTER TABLE public.batches 
ADD COLUMN IF NOT EXISTS total_builds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completed_builds INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER GENERATED ALWAYS AS (
  CASE 
    WHEN total_builds = 0 THEN 0
    ELSE ROUND((completed_builds::DECIMAL / total_builds) * 100)
  END
) STORED;

-- Function to update batch statistics
CREATE OR REPLACE FUNCTION update_batch_statistics(p_batch_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.batches
  SET 
    total_builds = (
      SELECT COUNT(*) FROM public.builds WHERE batch_id = p_batch_id
    ),
    completed_builds = (
      SELECT COUNT(*) FROM public.builds 
      WHERE batch_id = p_batch_id AND status = 'completed'
    ),
    is_complete = (
      SELECT COUNT(*) = COUNT(*) FILTER (WHERE status = 'completed')
      FROM public.builds WHERE batch_id = p_batch_id
    )
  WHERE id = p_batch_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update batch statistics when builds change
CREATE OR REPLACE FUNCTION trigger_update_batch_statistics()
RETURNS TRIGGER AS $$
BEGIN
  -- Update old batch if changing batch assignment
  IF TG_OP = 'UPDATE' AND OLD.batch_id IS DISTINCT FROM NEW.batch_id THEN
    IF OLD.batch_id IS NOT NULL THEN
      PERFORM update_batch_statistics(OLD.batch_id);
    END IF;
  END IF;
  
  -- Update new/current batch
  IF NEW.batch_id IS NOT NULL THEN
    PERFORM update_batch_statistics(NEW.batch_id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_batch_stats_on_build_change
  AFTER INSERT OR UPDATE OR DELETE ON public.builds
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_batch_statistics();