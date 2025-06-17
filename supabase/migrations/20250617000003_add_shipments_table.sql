-- Create shipments table
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_number TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES public.orders(id),
  build_id UUID REFERENCES public.builds(id),
  batch_id UUID REFERENCES public.batches(id),
  customer_id UUID REFERENCES public.customers(id),
  carrier TEXT NOT NULL,
  service_type TEXT,
  tracking_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  ship_date DATE,
  estimated_delivery DATE,
  actual_delivery DATE,
  shipping_cost DECIMAL(10, 2),
  insurance_value DECIMAL(10, 2),
  weight_lbs DECIMAL(10, 2),
  dimensions_length DECIMAL(10, 2),
  dimensions_width DECIMAL(10, 2),
  dimensions_height DECIMAL(10, 2),
  ship_to_name TEXT,
  ship_to_address1 TEXT,
  ship_to_address2 TEXT,
  ship_to_city TEXT,
  ship_to_state TEXT,
  ship_to_postal_code TEXT,
  ship_to_country TEXT DEFAULT 'US',
  ship_to_phone TEXT,
  ship_to_email TEXT,
  signature_required BOOLEAN DEFAULT FALSE,
  saturday_delivery BOOLEAN DEFAULT FALSE,
  packaging_type TEXT,
  contents_description TEXT,
  special_instructions TEXT,
  label_url TEXT,
  invoice_url TEXT,
  customs_info JSONB,
  created_by UUID REFERENCES public.workers(id),
  packed_by UUID REFERENCES public.workers(id),
  shipped_by UUID REFERENCES public.workers(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_carrier CHECK (carrier IN ('ups', 'fedex', 'usps', 'dhl', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'ready', 'in_transit', 'delivered', 'returned', 'cancelled', 'exception'))
);

-- Create shipment_items table for multi-item shipments
CREATE TABLE IF NOT EXISTS public.shipment_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  build_id UUID REFERENCES public.builds(id),
  serial_number TEXT,
  description TEXT,
  quantity INTEGER DEFAULT 1,
  weight_lbs DECIMAL(10, 2),
  value DECIMAL(10, 2),
  notes TEXT
);

-- Create shipment_tracking_events table
CREATE TABLE IF NOT EXISTS public.shipment_tracking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  event_type TEXT NOT NULL,
  event_description TEXT,
  location_city TEXT,
  location_state TEXT,
  location_country TEXT,
  raw_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_event_type CHECK (event_type IN ('label_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'exception', 'returned'))
);

-- Create indexes
CREATE INDEX idx_shipments_order_id ON public.shipments(order_id);
CREATE INDEX idx_shipments_build_id ON public.shipments(build_id);
CREATE INDEX idx_shipments_batch_id ON public.shipments(batch_id);
CREATE INDEX idx_shipments_tracking_number ON public.shipments(tracking_number);
CREATE INDEX idx_shipments_status ON public.shipments(status);
CREATE INDEX idx_shipments_ship_date ON public.shipments(ship_date);
CREATE INDEX idx_shipment_items_build_id ON public.shipment_items(build_id);
CREATE INDEX idx_shipment_tracking_events_date ON public.shipment_tracking_events(event_date);

-- Create sequence for shipment numbers
CREATE SEQUENCE IF NOT EXISTS shipment_number_seq;

-- Function to generate shipment number
CREATE OR REPLACE FUNCTION generate_shipment_number()
RETURNS TEXT AS $$
DECLARE
  v_year TEXT;
  v_seq TEXT;
BEGIN
  v_year := TO_CHAR(CURRENT_DATE, 'YY');
  v_seq := LPAD(nextval('shipment_number_seq')::TEXT, 6, '0');
  RETURN 'SHP-' || v_year || '-' || v_seq;
END;
$$ LANGUAGE plpgsql;

-- Set default for shipment_number
ALTER TABLE public.shipments ALTER COLUMN shipment_number SET DEFAULT generate_shipment_number();

-- Create triggers
CREATE TRIGGER update_shipments_updated_at
  BEFORE UPDATE ON public.shipments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_tracking_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shipments
CREATE POLICY "Workers can view shipments" ON public.shipments
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Workers can create shipments" ON public.shipments
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Workers can update shipments" ON public.shipments
  FOR UPDATE
  TO authenticated
  USING (TRUE);

-- RLS Policies for shipment_items
CREATE POLICY "Workers can view shipment items" ON public.shipment_items
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Workers can manage shipment items" ON public.shipment_items
  FOR ALL
  TO authenticated
  USING (TRUE)
  WITH CHECK (TRUE);

-- RLS Policies for shipment_tracking_events
CREATE POLICY "Workers can view tracking events" ON public.shipment_tracking_events
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "System can insert tracking events" ON public.shipment_tracking_events
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

-- Function to create shipment
CREATE OR REPLACE FUNCTION create_shipment(
  p_order_id UUID DEFAULT NULL,
  p_build_id UUID DEFAULT NULL,
  p_batch_id UUID DEFAULT NULL,
  p_carrier TEXT DEFAULT 'ups',
  p_service_type TEXT DEFAULT NULL,
  p_ship_to JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  v_shipment_id UUID;
  v_worker_id UUID;
  v_customer_id UUID;
BEGIN
  -- Get worker ID
  SELECT id INTO v_worker_id
  FROM public.workers
  WHERE auth_user_id = auth.uid();
  
  -- Get customer ID from order or build
  IF p_order_id IS NOT NULL THEN
    SELECT customer_id INTO v_customer_id
    FROM public.orders
    WHERE id = p_order_id;
  ELSIF p_build_id IS NOT NULL THEN
    SELECT o.customer_id INTO v_customer_id
    FROM public.builds b
    JOIN public.orders o ON o.id = b.order_id
    WHERE b.id = p_build_id;
  END IF;
  
  -- Create shipment
  INSERT INTO public.shipments (
    order_id, build_id, batch_id, customer_id,
    carrier, service_type, created_by,
    ship_to_name, ship_to_address1, ship_to_address2,
    ship_to_city, ship_to_state, ship_to_postal_code,
    ship_to_country, ship_to_phone, ship_to_email
  ) VALUES (
    p_order_id, p_build_id, p_batch_id, v_customer_id,
    p_carrier, p_service_type, v_worker_id,
    p_ship_to->>'name', p_ship_to->>'address1', p_ship_to->>'address2',
    p_ship_to->>'city', p_ship_to->>'state', p_ship_to->>'postal_code',
    COALESCE(p_ship_to->>'country', 'US'), p_ship_to->>'phone', p_ship_to->>'email'
  ) RETURNING id INTO v_shipment_id;
  
  -- Add items if build_id provided
  IF p_build_id IS NOT NULL THEN
    INSERT INTO public.shipment_items (
      shipment_id, build_id, serial_number, description
    )
    SELECT 
      v_shipment_id, b.id, b.serial_number,
      'ZMF ' || hm.name || ' Headphones'
    FROM public.builds b
    JOIN public.orders o ON o.id = b.order_id
    JOIN public.headphone_models hm ON hm.id = o.model_id
    WHERE b.id = p_build_id;
  END IF;
  
  RETURN v_shipment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update tracking
CREATE OR REPLACE FUNCTION update_shipment_tracking(
  p_shipment_id UUID,
  p_tracking_number TEXT,
  p_event_type TEXT,
  p_event_description TEXT,
  p_location JSONB DEFAULT NULL
) RETURNS BOOLEAN AS $$
BEGIN
  -- Update shipment
  UPDATE public.shipments
  SET 
    tracking_number = COALESCE(p_tracking_number, tracking_number),
    status = CASE 
      WHEN p_event_type = 'delivered' THEN 'delivered'
      WHEN p_event_type = 'exception' THEN 'exception'
      WHEN p_event_type = 'returned' THEN 'returned'
      WHEN p_event_type IN ('picked_up', 'in_transit', 'out_for_delivery') THEN 'in_transit'
      ELSE status
    END,
    actual_delivery = CASE 
      WHEN p_event_type = 'delivered' THEN CURRENT_DATE
      ELSE actual_delivery
    END
  WHERE id = p_shipment_id;
  
  -- Insert tracking event
  INSERT INTO public.shipment_tracking_events (
    shipment_id, event_date, event_type, event_description,
    location_city, location_state, location_country
  ) VALUES (
    p_shipment_id, CURRENT_TIMESTAMP, p_event_type, p_event_description,
    p_location->>'city', p_location->>'state', p_location->>'country'
  );
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate shipping cost
CREATE OR REPLACE FUNCTION calculate_shipping_cost(
  p_carrier TEXT,
  p_service_type TEXT,
  p_weight DECIMAL,
  p_dimensions JSONB,
  p_destination_postal TEXT
) RETURNS DECIMAL AS $$
DECLARE
  v_base_cost DECIMAL;
  v_weight_cost DECIMAL;
  v_dimension_cost DECIMAL;
  v_zone_multiplier DECIMAL;
BEGIN
  -- Base cost by carrier and service
  v_base_cost := CASE 
    WHEN p_carrier = 'ups' AND p_service_type = 'ground' THEN 12.50
    WHEN p_carrier = 'ups' AND p_service_type = '2day' THEN 28.00
    WHEN p_carrier = 'ups' AND p_service_type = 'overnight' THEN 45.00
    WHEN p_carrier = 'fedex' AND p_service_type = 'ground' THEN 11.75
    WHEN p_carrier = 'fedex' AND p_service_type = '2day' THEN 26.50
    WHEN p_carrier = 'fedex' AND p_service_type = 'overnight' THEN 42.00
    WHEN p_carrier = 'usps' THEN 8.50
    ELSE 15.00
  END;
  
  -- Weight cost (per pound over 1 lb)
  v_weight_cost := GREATEST(0, p_weight - 1) * 2.50;
  
  -- Dimensional weight calculation
  IF p_dimensions IS NOT NULL THEN
    v_dimension_cost := ((p_dimensions->>'length')::DECIMAL * 
                        (p_dimensions->>'width')::DECIMAL * 
                        (p_dimensions->>'height')::DECIMAL) / 139 * 0.75;
  ELSE
    v_dimension_cost := 0;
  END IF;
  
  -- Zone multiplier (simplified)
  v_zone_multiplier := CASE 
    WHEN LEFT(p_destination_postal, 1) IN ('0', '1', '2') THEN 1.2  -- East Coast
    WHEN LEFT(p_destination_postal, 1) IN ('7', '8', '9') THEN 1.3  -- West Coast
    ELSE 1.0  -- Central
  END;
  
  RETURN ROUND((v_base_cost + v_weight_cost + v_dimension_cost) * v_zone_multiplier, 2);
END;
$$ LANGUAGE plpgsql;