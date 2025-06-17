-- Create material_consumption table to track material usage per build
CREATE TABLE IF NOT EXISTS public.material_consumption (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id UUID NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES public.batches(id),
  order_id UUID REFERENCES public.orders(id),
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  consumed_by UUID REFERENCES public.workers(id),
  material_type TEXT NOT NULL,
  inventory_type TEXT NOT NULL,
  inventory_id UUID NOT NULL,
  quantity_consumed DECIMAL(10, 2) NOT NULL,
  unit_of_measure TEXT NOT NULL,
  stage TEXT NOT NULL,
  waste_quantity DECIMAL(10, 2) DEFAULT 0,
  waste_reason TEXT,
  unit_cost DECIMAL(10, 2),
  total_cost DECIMAL(10, 2) GENERATED ALWAYS AS (quantity_consumed * unit_cost) STORED,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_material_type CHECK (material_type IN ('wood', 'driver', 'chassis', 'cable', 'connector', 'padding', 'hardware', 'packaging', 'finishing', 'adhesive', 'other')),
  CONSTRAINT valid_inventory_type CHECK (inventory_type IN ('wood', 'component')),
  CONSTRAINT valid_stage CHECK (stage IN ('Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 'Final Assembly', 'Acoustic QC', 'Shipping', 'Rework')),
  CONSTRAINT positive_quantity CHECK (quantity_consumed > 0)
);

-- Create bill_of_materials table for standard material requirements
CREATE TABLE IF NOT EXISTS public.bill_of_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  model_id UUID NOT NULL REFERENCES public.headphone_models(id),
  material_type TEXT NOT NULL,
  material_name TEXT NOT NULL,
  material_sku TEXT,
  quantity_required DECIMAL(10, 2) NOT NULL,
  unit_of_measure TEXT NOT NULL,
  stage TEXT NOT NULL,
  is_optional BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_bom_material_type CHECK (material_type IN ('wood', 'driver', 'chassis', 'cable', 'connector', 'padding', 'hardware', 'packaging', 'finishing', 'adhesive', 'other')),
  CONSTRAINT valid_bom_stage CHECK (stage IN ('Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 'Final Assembly', 'Acoustic QC', 'Shipping'))
);

-- Create material_waste_tracking table for waste analysis
CREATE TABLE IF NOT EXISTS public.material_waste_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  waste_date DATE DEFAULT CURRENT_DATE,
  material_type TEXT NOT NULL,
  inventory_type TEXT NOT NULL,
  inventory_id UUID NOT NULL,
  quantity_wasted DECIMAL(10, 2) NOT NULL,
  waste_category TEXT NOT NULL,
  waste_reason TEXT NOT NULL,
  build_id UUID REFERENCES public.builds(id),
  batch_id UUID REFERENCES public.batches(id),
  reported_by UUID REFERENCES public.workers(id),
  stage TEXT,
  cost_impact DECIMAL(10, 2),
  preventable BOOLEAN DEFAULT TRUE,
  corrective_action TEXT,
  photos TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_waste_material_type CHECK (material_type IN ('wood', 'driver', 'chassis', 'cable', 'connector', 'padding', 'hardware', 'packaging', 'finishing', 'adhesive', 'other')),
  CONSTRAINT valid_waste_inventory_type CHECK (inventory_type IN ('wood', 'component')),
  CONSTRAINT valid_waste_category CHECK (waste_category IN ('defect', 'cutting', 'damage', 'measurement_error', 'quality_reject', 'expired', 'other')),
  CONSTRAINT valid_waste_stage CHECK (stage IN ('Intake', 'Sanding', 'Finishing', 'Sub-Assembly', 'Final Assembly', 'Acoustic QC', 'Shipping', 'Rework'))
);

-- Create indexes
CREATE INDEX idx_material_consumption_build_id ON public.material_consumption(build_id);
CREATE INDEX idx_material_consumption_batch_id ON public.material_consumption(batch_id);
CREATE INDEX idx_material_consumption_inventory ON public.material_consumption(inventory_type, inventory_id);
CREATE INDEX idx_material_consumption_stage ON public.material_consumption(stage);
CREATE INDEX idx_material_consumption_consumed_at ON public.material_consumption(consumed_at);
CREATE INDEX idx_bom_model_id ON public.bill_of_materials(model_id);
CREATE INDEX idx_bom_material_type ON public.bill_of_materials(material_type);
CREATE INDEX idx_bom_stage ON public.bill_of_materials(stage);
CREATE INDEX idx_waste_tracking_date ON public.material_waste_tracking(waste_date);
CREATE INDEX idx_waste_tracking_category ON public.material_waste_tracking(waste_category);

-- Create triggers
CREATE TRIGGER update_bill_of_materials_updated_at
  BEFORE UPDATE ON public.bill_of_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.material_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bill_of_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_waste_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies for material_consumption
CREATE POLICY "Workers can view material consumption" ON public.material_consumption
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Workers can record material consumption" ON public.material_consumption
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- RLS Policies for bill_of_materials
CREATE POLICY "Workers can view BOM" ON public.bill_of_materials
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Managers can manage BOM" ON public.bill_of_materials
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

-- RLS Policies for material_waste_tracking
CREATE POLICY "Workers can view waste tracking" ON public.material_waste_tracking
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Workers can report waste" ON public.material_waste_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Function to consume materials
CREATE OR REPLACE FUNCTION consume_materials(
  p_build_id UUID,
  p_stage TEXT,
  p_materials JSONB
) RETURNS BOOLEAN AS $$
DECLARE
  v_worker_id UUID;
  v_batch_id UUID;
  v_order_id UUID;
  v_material JSONB;
  v_inventory_type TEXT;
  v_current_quantity DECIMAL;
  v_reservation_id UUID;
BEGIN
  -- Get worker ID
  SELECT id INTO v_worker_id
  FROM public.workers
  WHERE auth_user_id = auth.uid();
  
  -- Get build info
  SELECT batch_id, order_id INTO v_batch_id, v_order_id
  FROM public.builds
  WHERE id = p_build_id;
  
  -- Process each material
  FOR v_material IN SELECT * FROM jsonb_array_elements(p_materials)
  LOOP
    -- Determine inventory type
    v_inventory_type := CASE 
      WHEN v_material->>'material_type' = 'wood' THEN 'wood'
      ELSE 'component'
    END;
    
    -- Check availability
    IF v_inventory_type = 'wood' THEN
      SELECT quantity_available INTO v_current_quantity
      FROM public.wood_inventory
      WHERE id = (v_material->>'inventory_id')::UUID;
    ELSE
      SELECT quantity_available INTO v_current_quantity
      FROM public.component_inventory
      WHERE id = (v_material->>'inventory_id')::UUID;
    END IF;
    
    IF v_current_quantity < (v_material->>'quantity')::DECIMAL THEN
      RAISE EXCEPTION 'Insufficient inventory for material %', v_material->>'material_name';
    END IF;
    
    -- Record consumption
    INSERT INTO public.material_consumption (
      build_id, batch_id, order_id, consumed_by,
      material_type, inventory_type, inventory_id,
      quantity_consumed, unit_of_measure, stage,
      waste_quantity, unit_cost, notes
    ) VALUES (
      p_build_id, v_batch_id, v_order_id, v_worker_id,
      v_material->>'material_type', v_inventory_type, (v_material->>'inventory_id')::UUID,
      (v_material->>'quantity')::DECIMAL, v_material->>'unit_of_measure', p_stage,
      COALESCE((v_material->>'waste_quantity')::DECIMAL, 0),
      (v_material->>'unit_cost')::DECIMAL, v_material->>'notes'
    );
    
    -- Update inventory
    IF v_inventory_type = 'wood' THEN
      UPDATE public.wood_inventory
      SET quantity_board_feet = quantity_board_feet - (v_material->>'quantity')::DECIMAL
      WHERE id = (v_material->>'inventory_id')::UUID;
    ELSE
      UPDATE public.component_inventory
      SET quantity_on_hand = quantity_on_hand - (v_material->>'quantity')::INTEGER
      WHERE id = (v_material->>'inventory_id')::UUID;
    END IF;
    
    -- Check for existing reservation and consume it
    SELECT id INTO v_reservation_id
    FROM public.material_reservations
    WHERE inventory_type = v_inventory_type
      AND inventory_id = (v_material->>'inventory_id')::UUID
      AND reserved_for_type = 'build'
      AND reserved_for_id = p_build_id
      AND status = 'active'
    LIMIT 1;
    
    IF v_reservation_id IS NOT NULL THEN
      UPDATE public.material_reservations
      SET status = 'consumed', released_at = CURRENT_TIMESTAMP
      WHERE id = v_reservation_id;
      
      -- Update reserved quantity
      IF v_inventory_type = 'wood' THEN
        UPDATE public.wood_inventory
        SET quantity_reserved = quantity_reserved - (v_material->>'quantity')::DECIMAL
        WHERE id = (v_material->>'inventory_id')::UUID;
      ELSE
        UPDATE public.component_inventory
        SET quantity_reserved = quantity_reserved - (v_material->>'quantity')::INTEGER
        WHERE id = (v_material->>'inventory_id')::UUID;
      END IF;
    END IF;
    
    -- Log inventory transaction
    INSERT INTO public.inventory_transactions (
      transaction_type, inventory_type, inventory_id,
      quantity, unit_cost, reference_type, reference_id,
      performed_by, reason
    ) VALUES (
      'issue', v_inventory_type, (v_material->>'inventory_id')::UUID,
      (v_material->>'quantity')::DECIMAL, (v_material->>'unit_cost')::DECIMAL,
      'build', p_build_id, v_worker_id,
      'Material consumed for stage: ' || p_stage
    );
  END LOOP;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate material cost for a build
CREATE OR REPLACE FUNCTION calculate_build_material_cost(p_build_id UUID)
RETURNS TABLE (
  total_cost DECIMAL,
  wood_cost DECIMAL,
  component_cost DECIMAL,
  finishing_cost DECIMAL,
  waste_cost DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    SUM(mc.total_cost) as total_cost,
    SUM(CASE WHEN mc.material_type = 'wood' THEN mc.total_cost ELSE 0 END) as wood_cost,
    SUM(CASE WHEN mc.material_type IN ('driver', 'chassis', 'cable', 'connector', 'hardware') THEN mc.total_cost ELSE 0 END) as component_cost,
    SUM(CASE WHEN mc.material_type IN ('finishing', 'adhesive', 'padding') THEN mc.total_cost ELSE 0 END) as finishing_cost,
    SUM(mc.waste_quantity * mc.unit_cost) as waste_cost
  FROM public.material_consumption mc
  WHERE mc.build_id = p_build_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get material requirements for a model
CREATE OR REPLACE FUNCTION get_material_requirements(p_model_id UUID)
RETURNS TABLE (
  stage TEXT,
  material_type TEXT,
  material_name TEXT,
  material_sku TEXT,
  quantity_required DECIMAL,
  unit_of_measure TEXT,
  is_optional BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bom.stage,
    bom.material_type,
    bom.material_name,
    bom.material_sku,
    bom.quantity_required,
    bom.unit_of_measure,
    bom.is_optional
  FROM public.bill_of_materials bom
  WHERE bom.model_id = p_model_id
  ORDER BY 
    CASE bom.stage
      WHEN 'Intake' THEN 1
      WHEN 'Sanding' THEN 2
      WHEN 'Finishing' THEN 3
      WHEN 'Sub-Assembly' THEN 4
      WHEN 'Final Assembly' THEN 5
      WHEN 'Acoustic QC' THEN 6
      WHEN 'Shipping' THEN 7
    END,
    bom.material_type;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample BOM data for headphone models
INSERT INTO public.bill_of_materials (model_id, material_type, material_name, material_sku, quantity_required, unit_of_measure, stage, is_optional) 
SELECT 
  hm.id,
  'wood',
  'Premium Hardwood',
  'WOOD-' || UPPER(hm.name),
  CASE 
    WHEN hm.name IN ('Verite', 'Atrium') THEN 2.5
    WHEN hm.name IN ('Eikon', 'Auteur') THEN 2.0
    ELSE 1.5
  END,
  'board_feet',
  'Intake',
  FALSE
FROM public.headphone_models hm;

-- Add common components to BOM
INSERT INTO public.bill_of_materials (model_id, material_type, material_name, material_sku, quantity_required, unit_of_measure, stage, is_optional)
SELECT 
  hm.id,
  material_type,
  material_name,
  material_sku,
  quantity_required,
  unit_of_measure,
  stage,
  is_optional
FROM public.headphone_models hm
CROSS JOIN (VALUES
  ('driver', 'Biocellulose Driver', 'DRV-BIO-50', 2, 'pieces', 'Sub-Assembly', FALSE),
  ('chassis', 'Aluminum Chassis', 'CHS-ALU-001', 2, 'pieces', 'Sub-Assembly', FALSE),
  ('cable', 'OFC Cable', 'CBL-OFC-6FT', 1, 'pieces', 'Final Assembly', FALSE),
  ('connector', '1/4" Connector', 'CON-6.35MM', 1, 'pieces', 'Final Assembly', FALSE),
  ('padding', 'Lambskin Ear Pads', 'PAD-LAMB-01', 2, 'pieces', 'Final Assembly', FALSE),
  ('hardware', 'Mounting Screws', 'HW-SCREWS-SET', 1, 'set', 'Sub-Assembly', FALSE),
  ('finishing', 'Wood Finish', 'FIN-POLY-01', 0.25, 'liters', 'Finishing', FALSE),
  ('adhesive', 'Wood Glue', 'ADH-WOOD-01', 0.1, 'liters', 'Sub-Assembly', FALSE),
  ('packaging', 'Presentation Case', 'PKG-CASE-01', 1, 'pieces', 'Shipping', FALSE)
) AS components(material_type, material_name, material_sku, quantity_required, unit_of_measure, stage, is_optional);