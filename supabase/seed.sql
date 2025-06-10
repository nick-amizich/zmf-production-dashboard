-- Create demo users
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'manager@zmf.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('22222222-2222-2222-2222-222222222222', 'worker@zmf.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('33333333-3333-3333-3333-333333333333', 'tony@zmf.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW()),
  ('44444444-4444-4444-4444-444444444444', 'jake@zmf.com', crypt('password123', gen_salt('bf')), NOW(), NOW(), NOW());

-- Create corresponding worker records
INSERT INTO workers (auth_user_id, name, email, role, specializations)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Production Manager', 'manager@zmf.com', 'manager', '{}'),
  ('22222222-2222-2222-2222-222222222222', 'Test Worker', 'worker@zmf.com', 'worker', ARRAY['Intake', 'Sanding']::production_stage[]),
  ('33333333-3333-3333-3333-333333333333', 'Tony Martinez', 'tony@zmf.com', 'worker', ARRAY['Intake', 'Sanding']::production_stage[]),
  ('44444444-4444-4444-4444-444444444444', 'Jake Thompson', 'jake@zmf.com', 'worker', ARRAY['Sanding', 'Final Assembly']::production_stage[]);

-- Create some sample customers
INSERT INTO customers (name, email, phone)
VALUES
  ('John Smith', 'john.smith@example.com', '555-0101'),
  ('Jane Doe', 'jane.doe@example.com', '555-0102'),
  ('Bob Johnson', 'bob.johnson@example.com', '555-0103');

-- Create sample orders
INSERT INTO orders (order_number, customer_id, model_id, wood_type, customizations, status)
VALUES
  ('ZMF-2024-0001', 
   (SELECT id FROM customers WHERE email = 'john.smith@example.com'),
   (SELECT id FROM headphone_models WHERE name = 'Verite'),
   'Sapele',
   '{"grille": "black", "chassis": "aluminum", "pads": "universe"}',
   'pending'),
  
  ('ZMF-2024-0002',
   (SELECT id FROM customers WHERE email = 'jane.doe@example.com'),
   (SELECT id FROM headphone_models WHERE name = 'Atticus'),
   'Cherry',
   '{"grille": "silver", "chassis": "aluminum", "pads": "auteur"}',
   'pending'),
   
  ('ZMF-2024-0003',
   (SELECT id FROM customers WHERE email = 'bob.johnson@example.com'),
   (SELECT id FROM headphone_models WHERE name = 'Caldera'),
   'Cocobolo',
   '{"grille": "black", "chassis": "magnesium", "pads": "verite"}',
   'pending');

-- Create a sample batch
INSERT INTO batches (batch_number, priority)
VALUES
  ('BATCH-2024-001', 'standard');

-- Add orders to batch
INSERT INTO batch_orders (batch_id, order_id)
VALUES
  ((SELECT id FROM batches WHERE batch_number = 'BATCH-2024-001'),
   (SELECT id FROM orders WHERE order_number = 'ZMF-2024-0001')),
  ((SELECT id FROM batches WHERE batch_number = 'BATCH-2024-001'),
   (SELECT id FROM orders WHERE order_number = 'ZMF-2024-0002'));