-- Add worker approval system fields and functionality

-- Create enum for approval status
CREATE TYPE approval_status AS ENUM ('pending', 'approved', 'rejected');

-- Add approval fields to workers table
ALTER TABLE workers 
ADD COLUMN approval_status approval_status DEFAULT 'pending',
ADD COLUMN approved_by uuid REFERENCES workers(id),
ADD COLUMN approved_at timestamptz,
ADD COLUMN rejection_reason text,
ADD COLUMN requested_at timestamptz DEFAULT NOW();

-- Update existing workers to be approved (so current workers aren't locked out)
UPDATE workers 
SET approval_status = 'approved',
    approved_at = NOW()
WHERE is_active = true;

-- Create function to check if worker is approved
CREATE OR REPLACE FUNCTION is_worker_approved(worker_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM workers 
    WHERE id = worker_id 
    AND approval_status = 'approved'
    AND is_active = true
  );
END;
$$;

-- Create view for pending worker approvals (for admin dashboard)
CREATE OR REPLACE VIEW pending_worker_approvals AS
SELECT 
  w.id,
  w.name,
  w.email,
  w.requested_at,
  w.hourly_rate,
  w.specializations,
  au.email_confirmed_at,
  au.last_sign_in_at
FROM workers w
LEFT JOIN auth.users au ON w.auth_user_id = au.id
WHERE w.approval_status = 'pending'
ORDER BY w.requested_at ASC;

-- Grant access to the view for authenticated users
GRANT SELECT ON pending_worker_approvals TO authenticated;

-- Update RLS policies to restrict pending workers

-- First, let's update the main workers policy to prevent pending workers from accessing other data
-- We'll need to update existing policies that check for worker access

-- Helper function to check if current user is an approved worker
CREATE OR REPLACE FUNCTION get_current_worker_approval_status()
RETURNS approval_status
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  worker_approval_status approval_status;
BEGIN
  SELECT approval_status INTO worker_approval_status
  FROM workers
  WHERE auth_user_id = auth.uid();
  
  RETURN worker_approval_status;
END;
$$;

-- Update worker select policy to allow workers to see their own record regardless of approval status
DROP POLICY IF EXISTS "Workers can view workers" ON workers;
CREATE POLICY "Workers can view workers" ON workers
  FOR SELECT
  USING (
    -- Workers can always see their own record
    auth_user_id = auth.uid() OR
    -- Approved workers can see other workers based on role
    (get_current_worker_approval_status() = 'approved' AND (
      get_user_role() IN ('admin', 'manager') OR
      (get_user_role() = 'worker' AND id = get_current_worker_id())
    ))
  );

-- Create policy for updating approval status (only admins/managers)
CREATE POLICY "Admins and managers can update worker approval" ON workers
  FOR UPDATE
  USING (get_user_role() IN ('admin', 'manager'))
  WITH CHECK (get_user_role() IN ('admin', 'manager'));

-- Restrict other table access for non-approved workers
-- We'll add a check to existing policies

-- Function to check if current user is approved (for use in policies)
CREATE OR REPLACE FUNCTION is_current_user_approved()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Admins and managers are always considered approved
  IF get_user_role() IN ('admin', 'manager') THEN
    RETURN true;
  END IF;
  
  -- Check worker approval status
  RETURN get_current_worker_approval_status() = 'approved';
END;
$$;

-- Update policies on production tables to check approval status
-- For brevity, showing pattern for one table - this would need to be applied to all tables

-- Example: Update batches table policies
DROP POLICY IF EXISTS "Workers can view batches" ON batches;
CREATE POLICY "Workers can view batches" ON batches
  FOR SELECT
  USING (
    is_current_user_approved() AND (
      get_user_role() IN ('admin', 'manager') OR 
      get_user_role() = 'worker'
    )
  );

-- Add audit trigger for approval actions
CREATE OR REPLACE FUNCTION audit_worker_approval()
RETURNS TRIGGER AS $$
BEGIN
  -- Log approval status changes
  IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
    INSERT INTO audit_logs (
      table_name,
      record_id,
      action,
      old_values,
      new_values,
      user_id,
      worker_id
    ) VALUES (
      'workers',
      NEW.id,
      CASE 
        WHEN NEW.approval_status = 'approved' THEN 'worker_approved'
        WHEN NEW.approval_status = 'rejected' THEN 'worker_rejected'
        ELSE 'approval_status_changed'
      END,
      jsonb_build_object(
        'approval_status', OLD.approval_status,
        'approved_by', OLD.approved_by,
        'approved_at', OLD.approved_at,
        'rejection_reason', OLD.rejection_reason
      ),
      jsonb_build_object(
        'approval_status', NEW.approval_status,
        'approved_by', NEW.approved_by,
        'approved_at', NEW.approved_at,
        'rejection_reason', NEW.rejection_reason
      ),
      auth.uid(),
      get_current_worker_id()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for approval auditing
CREATE TRIGGER audit_worker_approval_trigger
AFTER UPDATE ON workers
FOR EACH ROW
WHEN (OLD.approval_status IS DISTINCT FROM NEW.approval_status)
EXECUTE FUNCTION audit_worker_approval();

-- Create function to approve a worker (with validation)
CREATE OR REPLACE FUNCTION approve_worker(
  worker_id uuid,
  approver_notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  approver_id uuid;
BEGIN
  -- Check if user has permission
  IF get_user_role() NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Only admins and managers can approve workers';
  END IF;
  
  -- Get approver's worker ID
  SELECT id INTO approver_id FROM workers WHERE auth_user_id = auth.uid();
  
  -- Update worker status
  UPDATE workers
  SET 
    approval_status = 'approved',
    approved_by = approver_id,
    approved_at = NOW(),
    rejection_reason = approver_notes
  WHERE id = worker_id
    AND approval_status = 'pending';
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Worker not found or already processed';
  END IF;
END;
$$;

-- Create function to reject a worker
CREATE OR REPLACE FUNCTION reject_worker(
  worker_id uuid,
  reason text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  approver_id uuid;
BEGIN
  -- Check if user has permission
  IF get_user_role() NOT IN ('admin', 'manager') THEN
    RAISE EXCEPTION 'Only admins and managers can reject workers';
  END IF;
  
  -- Validate reason is provided
  IF reason IS NULL OR trim(reason) = '' THEN
    RAISE EXCEPTION 'Rejection reason is required';
  END IF;
  
  -- Get approver's worker ID
  SELECT id INTO approver_id FROM workers WHERE auth_user_id = auth.uid();
  
  -- Update worker status
  UPDATE workers
  SET 
    approval_status = 'rejected',
    approved_by = approver_id,
    approved_at = NOW(),
    rejection_reason = reason,
    is_active = false -- Also deactivate the worker
  WHERE id = worker_id
    AND approval_status = 'pending';
    
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Worker not found or already processed';
  END IF;
END;
$$;

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION is_worker_approved TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_worker_approval_status TO authenticated;
GRANT EXECUTE ON FUNCTION is_current_user_approved TO authenticated;
GRANT EXECUTE ON FUNCTION approve_worker TO authenticated;
GRANT EXECUTE ON FUNCTION reject_worker TO authenticated;