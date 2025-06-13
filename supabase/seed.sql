-- Note: Demo users will be created via scripts/create-demo-users.js
-- This is because direct insertion into auth.users doesn't work in local development

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