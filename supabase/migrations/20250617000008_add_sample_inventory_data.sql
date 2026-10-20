-- Add sample wood inventory data
INSERT INTO public.wood_inventory (
  wood_type, grade, quantity_board_feet, cost_per_board_foot, 
  reorder_point, reorder_quantity, supplier, location, notes
) VALUES
  ('Walnut', 'A', 150, 12.50, 100, 200, 'Premium Wood Suppliers', 'Rack A1-A3', 'High-grade walnut for premium builds'),
  ('Cherry', 'A', 225, 10.00, 150, 300, 'Premium Wood Suppliers', 'Rack A4-A6', 'Beautiful cherry wood stock'),
  ('Maple', 'B', 80, 8.50, 100, 200, 'Local Lumber Co', 'Rack B1-B2', 'Good quality maple'),
  ('Oak', 'A', 300, 9.00, 200, 400, 'Premium Wood Suppliers', 'Rack B3-B5', 'Classic oak for traditional models'),
  ('Zebrawood', 'A', 45, 25.00, 50, 100, 'Exotic Woods International', 'Rack C1', 'Exotic zebrawood - limited stock'),
  ('Ebony', 'A', 30, 45.00, 40, 80, 'Exotic Woods International', 'Rack C2', 'Premium ebony - handle with care'),
  ('Pine', 'B', 400, 4.50, 300, 500, 'Local Lumber Co', 'Rack D1-D3', 'Softwood for internal components')
ON CONFLICT DO NOTHING;

-- Add sample component inventory data
INSERT INTO public.component_inventory (
  component_type, component_name, sku, quantity_on_hand, unit_cost,
  reorder_point, reorder_quantity, lead_time_days, supplier, location, notes
) VALUES
  ('driver', '50mm Drivers', 'DRV-001', 120, 25.00, 100, 200, 14, 'Audio Components Ltd', 'Bin E1', 'High-quality 50mm headphone drivers'),
  ('driver', '40mm Drivers', 'DRV-002', 200, 18.00, 150, 300, 14, 'Audio Components Ltd', 'Bin E2', 'Standard 40mm headphone drivers'),
  ('cable', 'Premium Cable', 'CBL-001', 85, 15.00, 100, 200, 7, 'Cable Masters', 'Bin F1', '6ft braided audio cable with 3.5mm jack'),
  ('cable', 'Standard Cable', 'CBL-002', 150, 8.00, 100, 250, 7, 'Cable Masters', 'Bin F2', '6ft standard audio cable'),
  ('padding', 'Leather Ear Pads', 'PAD-001', 60, 22.00, 80, 150, 10, 'Comfort Audio Supplies', 'Bin G1', 'Premium leather ear cushions'),
  ('padding', 'Velour Ear Pads', 'PAD-002', 90, 18.00, 80, 150, 10, 'Comfort Audio Supplies', 'Bin G2', 'Soft velour ear cushions'),
  ('hardware', 'Adjustment Hardware Kit', 'HDW-001', 70, 12.00, 60, 120, 7, 'Metal Works Inc', 'Bin H1', 'Complete headband adjustment mechanism'),
  ('hardware', 'Hinge Assembly', 'HDW-002', 45, 8.50, 50, 100, 7, 'Metal Works Inc', 'Bin H2', 'Folding hinge mechanism'),
  ('packaging', 'Premium Box', 'PKG-001', 95, 6.50, 100, 200, 3, 'Pack Right Solutions', 'Shelf J1', 'Luxury packaging box with foam insert'),
  ('packaging', 'Standard Box', 'PKG-002', 180, 3.50, 150, 300, 3, 'Pack Right Solutions', 'Shelf J2', 'Standard packaging with protective insert')
ON CONFLICT DO NOTHING;

-- Add some sample material reservations
DO $$
DECLARE
  v_walnut_id UUID;
  v_driver_id UUID;
  v_build_id UUID;
BEGIN
  -- Get IDs for reservation examples
  SELECT id INTO v_walnut_id FROM public.wood_inventory WHERE wood_type = 'Walnut' LIMIT 1;
  SELECT id INTO v_driver_id FROM public.component_inventory WHERE sku = 'DRV-001' LIMIT 1;
  SELECT id INTO v_build_id FROM public.builds LIMIT 1;
  
  -- Only create reservations if we have the necessary data
  IF v_walnut_id IS NOT NULL AND v_build_id IS NOT NULL THEN
    -- Reserve some walnut for a build
    INSERT INTO public.material_reservations (
      inventory_type, inventory_id, quantity, reserved_for_type, reserved_for_id, 
      notes, reserved_by
    ) VALUES (
      'wood', v_walnut_id, 5, 'build', v_build_id, 
      'Reserved for custom order', (SELECT id FROM public.workers WHERE role = 'manager' LIMIT 1)
    );
    
    -- Update the reserved quantity
    UPDATE public.wood_inventory 
    SET quantity_reserved = COALESCE(quantity_reserved, 0) + 5
    WHERE id = v_walnut_id;
  END IF;
  
  IF v_driver_id IS NOT NULL AND v_build_id IS NOT NULL THEN
    -- Reserve drivers for a build
    INSERT INTO public.material_reservations (
      inventory_type, inventory_id, quantity, reserved_for_type, reserved_for_id,
      notes, reserved_by
    ) VALUES (
      'component', v_driver_id, 2, 'build', v_build_id,
      'Reserved for premium build', (SELECT id FROM public.workers WHERE role = 'manager' LIMIT 1)
    );
    
    -- Update the reserved quantity
    UPDATE public.component_inventory 
    SET quantity_reserved = COALESCE(quantity_reserved, 0) + 2
    WHERE id = v_driver_id;
  END IF;
END $$;