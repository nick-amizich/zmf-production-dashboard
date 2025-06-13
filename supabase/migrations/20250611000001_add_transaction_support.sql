-- Add transaction support functions
-- These functions allow for proper transaction handling in Supabase

-- Function to begin a transaction (placeholder for client-side transaction tracking)
CREATE OR REPLACE FUNCTION begin_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- In Supabase, transactions are handled automatically per request
  -- This is a placeholder for client-side transaction tracking
  PERFORM pg_advisory_lock(1);
END;
$$;

-- Function to commit a transaction
CREATE OR REPLACE FUNCTION commit_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Release advisory lock
  PERFORM pg_advisory_unlock(1);
END;
$$;

-- Function to rollback a transaction
CREATE OR REPLACE FUNCTION rollback_transaction()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Release advisory lock and raise exception to trigger rollback
  PERFORM pg_advisory_unlock(1);
  RAISE EXCEPTION 'Transaction rolled back';
END;
$$;

-- Function to create a batch with orders in a single transaction
CREATE OR REPLACE FUNCTION create_batch_with_orders(
  p_batch_number text,
  p_priority batch_priority,
  p_order_ids uuid[],
  p_worker_id uuid,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_batch_id uuid;
  v_order_id uuid;
BEGIN
  -- Create the batch
  INSERT INTO batches (batch_number, priority, notes)
  VALUES (p_batch_number, p_priority, p_notes)
  RETURNING id INTO v_batch_id;
  
  -- Add orders to batch and update their status
  FOREACH v_order_id IN ARRAY p_order_ids
  LOOP
    -- Verify order exists and is pending
    IF NOT EXISTS (
      SELECT 1 FROM orders 
      WHERE id = v_order_id AND status = 'pending'
    ) THEN
      RAISE EXCEPTION 'Order % is not valid or not pending', v_order_id;
    END IF;
    
    -- Add to batch_orders
    INSERT INTO batch_orders (batch_id, order_id)
    VALUES (v_batch_id, v_order_id);
    
    -- Update order status
    UPDATE orders 
    SET status = 'in_production', 
        updated_at = NOW()
    WHERE id = v_order_id;
  END LOOP;
  
  -- Create initial stage assignment
  INSERT INTO stage_assignments (batch_id, stage, worker_id)
  VALUES (v_batch_id, 'Intake', p_worker_id);
  
  -- Log the batch creation
  INSERT INTO system_logs (action, context, details, created_by)
  VALUES (
    'batch_created',
    'production',
    jsonb_build_object(
      'batch_id', v_batch_id,
      'batch_number', p_batch_number,
      'order_count', array_length(p_order_ids, 1),
      'priority', p_priority
    ),
    p_worker_id
  );
  
  RETURN v_batch_id;
END;
$$;

-- Function to transition batch stage with all related updates
CREATE OR REPLACE FUNCTION transition_batch_stage(
  p_batch_id uuid,
  p_to_stage production_stage,
  p_worker_id uuid,
  p_quality_check_id uuid DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_stage production_stage;
  v_current_assignment_id uuid;
BEGIN
  -- Get current stage
  SELECT current_stage INTO v_current_stage
  FROM batches
  WHERE id = p_batch_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Batch % not found', p_batch_id;
  END IF;
  
  -- Validate stage transition
  IF NOT is_valid_stage_transition(v_current_stage, p_to_stage) THEN
    RAISE EXCEPTION 'Invalid stage transition from % to %', v_current_stage, p_to_stage;
  END IF;
  
  -- Complete current assignment
  UPDATE stage_assignments
  SET completed_at = NOW(),
      quality_status = 'good'
  WHERE batch_id = p_batch_id 
    AND stage = v_current_stage
    AND completed_at IS NULL
  RETURNING id INTO v_current_assignment_id;
  
  -- Update batch stage
  UPDATE batches
  SET current_stage = p_to_stage,
      updated_at = NOW()
  WHERE id = p_batch_id;
  
  -- Create new stage assignment
  INSERT INTO stage_assignments (batch_id, stage, worker_id)
  VALUES (p_batch_id, p_to_stage, p_worker_id);
  
  -- Log stage transition
  INSERT INTO stage_transitions (
    batch_id, 
    from_stage, 
    to_stage, 
    transitioned_by, 
    quality_check_id,
    notes
  )
  VALUES (
    p_batch_id,
    v_current_stage,
    p_to_stage,
    p_worker_id,
    p_quality_check_id,
    p_notes
  );
  
  -- If moving to Shipping, complete the batch
  IF p_to_stage = 'Shipping' THEN
    UPDATE batches
    SET completed_at = NOW(),
        status = 'completed'
    WHERE id = p_batch_id;
    
    -- Update all orders in batch to completed
    UPDATE orders
    SET status = 'completed',
        completed_at = NOW(),
        completed_by = p_worker_id
    WHERE id IN (
      SELECT order_id 
      FROM batch_orders 
      WHERE batch_id = p_batch_id
    );
  END IF;
END;
$$;

-- Helper function to validate stage transitions
CREATE OR REPLACE FUNCTION is_valid_stage_transition(
  p_from_stage production_stage,
  p_to_stage production_stage
)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_stage_order text[] := ARRAY[
    'Intake',
    'Sanding',
    'Finishing',
    'Sub-Assembly',
    'Final Assembly',
    'Acoustic QC',
    'Shipping'
  ];
  v_from_index int;
  v_to_index int;
BEGIN
  -- Find indices
  v_from_index := array_position(v_stage_order, p_from_stage::text);
  v_to_index := array_position(v_stage_order, p_to_stage::text);
  
  -- Valid if moving forward in the pipeline
  RETURN v_to_index > v_from_index;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION begin_transaction() TO authenticated;
GRANT EXECUTE ON FUNCTION commit_transaction() TO authenticated;
GRANT EXECUTE ON FUNCTION rollback_transaction() TO authenticated;
GRANT EXECUTE ON FUNCTION create_batch_with_orders(text, batch_priority, uuid[], uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION transition_batch_stage(uuid, production_stage, uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION is_valid_stage_transition(production_stage, production_stage) TO authenticated;