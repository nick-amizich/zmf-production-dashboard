-- Create wood inventory table
CREATE TABLE IF NOT EXISTS public.wood_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wood_type TEXT NOT NULL,
  supplier TEXT,
  lot_number TEXT,
  quantity_board_feet DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity_reserved DECIMAL(10, 2) NOT NULL DEFAULT 0,
  quantity_available DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_board_feet - quantity_reserved) STORED,
  cost_per_board_foot DECIMAL(10, 2),
  total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_board_feet * cost_per_board_foot) STORED,
  location TEXT,
  grade TEXT,
  notes TEXT,
  reorder_point DECIMAL(10, 2) DEFAULT 50,
  reorder_quantity DECIMAL(10, 2) DEFAULT 100,
  received_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_quantity CHECK (quantity_board_feet >= 0),
  CONSTRAINT valid_reserved CHECK (quantity_reserved >= 0 AND quantity_reserved <= quantity_board_feet)
);

-- Create component inventory table
CREATE TABLE IF NOT EXISTS public.component_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  component_type TEXT NOT NULL,
  component_name TEXT NOT NULL,
  sku TEXT UNIQUE,
  quantity_on_hand INTEGER NOT NULL DEFAULT 0,
  quantity_reserved INTEGER NOT NULL DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_reserved) STORED,
  unit_cost DECIMAL(10, 2),
  total_value DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_on_hand * unit_cost) STORED,
  supplier TEXT,
  location TEXT,
  reorder_point INTEGER DEFAULT 10,
  reorder_quantity INTEGER DEFAULT 50,
  lead_time_days INTEGER DEFAULT 7,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_component_quantity CHECK (quantity_on_hand >= 0),
  CONSTRAINT valid_component_reserved CHECK (quantity_reserved >= 0 AND quantity_reserved <= quantity_on_hand),
  CONSTRAINT valid_component_type CHECK (component_type IN ('driver', 'chassis', 'cable', 'connector', 'padding', 'hardware', 'packaging', 'other'))
);

-- Create inventory transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.inventory_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_type TEXT NOT NULL,
  inventory_type TEXT NOT NULL,
  inventory_id UUID NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2),
  reference_type TEXT,
  reference_id UUID,
  reason TEXT,
  performed_by UUID REFERENCES public.workers(id),
  transaction_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('receipt', 'issue', 'adjustment', 'return', 'scrap', 'reserve', 'release')),
  CONSTRAINT valid_inventory_type CHECK (inventory_type IN ('wood', 'component'))
);

-- Create material reservations table
CREATE TABLE IF NOT EXISTS public.material_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_type TEXT NOT NULL,
  inventory_type TEXT NOT NULL,
  inventory_id UUID NOT NULL,
  reserved_for_type TEXT NOT NULL,
  reserved_for_id UUID NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  reserved_by UUID REFERENCES public.workers(id),
  reserved_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  released_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'active',
  notes TEXT,
  CONSTRAINT valid_reservation_type CHECK (reservation_type IN ('build', 'batch', 'order')),
  CONSTRAINT valid_inventory_type CHECK (inventory_type IN ('wood', 'component')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'released', 'consumed', 'cancelled'))
);

-- Create indexes
CREATE INDEX idx_wood_inventory_type ON public.wood_inventory(wood_type);
CREATE INDEX idx_wood_inventory_available ON public.wood_inventory(quantity_available);
CREATE INDEX idx_component_inventory_type ON public.component_inventory(component_type);
CREATE INDEX idx_component_inventory_sku ON public.component_inventory(sku);
CREATE INDEX idx_component_inventory_available ON public.component_inventory(quantity_available);
CREATE INDEX idx_inventory_transactions_date ON public.inventory_transactions(transaction_date);
CREATE INDEX idx_inventory_transactions_inventory ON public.inventory_transactions(inventory_type, inventory_id);
CREATE INDEX idx_material_reservations_status ON public.material_reservations(status);
CREATE INDEX idx_material_reservations_for ON public.material_reservations(reserved_for_type, reserved_for_id);

-- Create triggers
CREATE TRIGGER update_wood_inventory_updated_at
  BEFORE UPDATE ON public.wood_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_component_inventory_updated_at
  BEFORE UPDATE ON public.component_inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.wood_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.component_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_reservations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for wood_inventory
CREATE POLICY "Workers can view wood inventory" ON public.wood_inventory
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Managers can manage wood inventory" ON public.wood_inventory
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

-- RLS Policies for component_inventory
CREATE POLICY "Workers can view component inventory" ON public.component_inventory
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Managers can manage component inventory" ON public.component_inventory
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

-- RLS Policies for inventory_transactions
CREATE POLICY "Workers can view inventory transactions" ON public.inventory_transactions
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Workers can create inventory transactions" ON public.inventory_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- RLS Policies for material_reservations
CREATE POLICY "Workers can view material reservations" ON public.material_reservations
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Workers can create material reservations" ON public.material_reservations
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Workers can update own reservations" ON public.material_reservations
  FOR UPDATE
  TO authenticated
  USING (
    reserved_by IN (
      SELECT id FROM public.workers
      WHERE auth_user_id = auth.uid()
    )
  );

-- Helper function to reserve materials
CREATE OR REPLACE FUNCTION reserve_materials(
  p_inventory_type TEXT,
  p_inventory_id UUID,
  p_quantity DECIMAL,
  p_for_type TEXT,
  p_for_id UUID,
  p_notes TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_reservation_id UUID;
  v_worker_id UUID;
  v_available DECIMAL;
BEGIN
  -- Get worker ID
  SELECT id INTO v_worker_id
  FROM public.workers
  WHERE auth_user_id = auth.uid();
  
  -- Check availability based on type
  IF p_inventory_type = 'wood' THEN
    SELECT quantity_available INTO v_available
    FROM public.wood_inventory
    WHERE id = p_inventory_id;
    
    IF v_available < p_quantity THEN
      RAISE EXCEPTION 'Insufficient wood inventory. Available: %, Requested: %', v_available, p_quantity;
    END IF;
    
    -- Update reserved quantity
    UPDATE public.wood_inventory
    SET quantity_reserved = quantity_reserved + p_quantity
    WHERE id = p_inventory_id;
  ELSE
    SELECT quantity_available INTO v_available
    FROM public.component_inventory
    WHERE id = p_inventory_id;
    
    IF v_available < p_quantity THEN
      RAISE EXCEPTION 'Insufficient component inventory. Available: %, Requested: %', v_available, p_quantity;
    END IF;
    
    -- Update reserved quantity
    UPDATE public.component_inventory
    SET quantity_reserved = quantity_reserved + p_quantity
    WHERE id = p_inventory_id;
  END IF;
  
  -- Create reservation
  INSERT INTO public.material_reservations (
    reservation_type, inventory_type, inventory_id,
    reserved_for_type, reserved_for_id, quantity,
    reserved_by, notes
  ) VALUES (
    p_for_type, p_inventory_type, p_inventory_id,
    p_for_type, p_for_id, p_quantity,
    v_worker_id, p_notes
  ) RETURNING id INTO v_reservation_id;
  
  -- Log transaction
  INSERT INTO public.inventory_transactions (
    transaction_type, inventory_type, inventory_id,
    quantity, reference_type, reference_id,
    performed_by, reason
  ) VALUES (
    'reserve', p_inventory_type, p_inventory_id,
    p_quantity, 'reservation', v_reservation_id,
    v_worker_id, 'Material reserved for ' || p_for_type
  );
  
  RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check inventory levels
CREATE OR REPLACE FUNCTION check_inventory_levels()
RETURNS TABLE (
  inventory_type TEXT,
  item_name TEXT,
  quantity_available DECIMAL,
  reorder_point DECIMAL,
  needs_reorder BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'wood'::TEXT as inventory_type,
    wood_type as item_name,
    wi.quantity_available,
    wi.reorder_point,
    wi.quantity_available < wi.reorder_point as needs_reorder
  FROM public.wood_inventory wi
  WHERE wi.is_active = true
  UNION ALL
  SELECT 
    'component'::TEXT as inventory_type,
    component_name as item_name,
    ci.quantity_available::DECIMAL,
    ci.reorder_point::DECIMAL,
    ci.quantity_available < ci.reorder_point as needs_reorder
  FROM public.component_inventory ci
  WHERE ci.is_active = true
  ORDER BY needs_reorder DESC, quantity_available ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;