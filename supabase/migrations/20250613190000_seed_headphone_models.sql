-- Insert default headphone models if they don't exist
INSERT INTO headphone_models (name, complexity, base_production_hours, wood_types, is_active)
VALUES 
  ('Atrium', 'high'::model_complexity, 8.5, ARRAY['Sapele', 'Cherry', 'Walnut', 'Ash', 'Maple', 'Cocobolo', 'Katalox', 'Ziricote', 'Blackwood']::wood_type[], true),
  ('Caldera', 'very_high'::model_complexity, 10.0, ARRAY['Sapele', 'Cherry', 'Walnut', 'Ash', 'Maple', 'Cocobolo', 'Katalox', 'Ziricote', 'Blackwood']::wood_type[], true),
  ('Verite', 'medium'::model_complexity, 6.5, ARRAY['Sapele', 'Cherry', 'Walnut', 'Ash', 'Maple', 'Cocobolo', 'Katalox', 'Ziricote', 'Blackwood']::wood_type[], true)
ON CONFLICT (name) DO NOTHING;