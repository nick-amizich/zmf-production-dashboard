-- Add helper functions needed by other migrations

-- Function to get current worker ID
CREATE OR REPLACE FUNCTION get_current_worker_id()
RETURNS uuid AS $$
DECLARE
  worker_id uuid;
BEGIN
  SELECT id INTO worker_id
  FROM workers
  WHERE auth_user_id = auth.uid();
  
  RETURN worker_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_current_worker_id TO authenticated;