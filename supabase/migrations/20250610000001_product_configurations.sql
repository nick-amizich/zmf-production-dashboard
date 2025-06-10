-- Product Configuration Tables

-- Main product configurations table
CREATE TABLE product_configurations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  shopify_product_id text NOT NULL UNIQUE,
  name text NOT NULL,
  base_price integer NOT NULL, -- in cents
  base_sku text NOT NULL,
  description text,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Product options (both variants and properties)
CREATE TABLE product_options (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  configuration_id uuid REFERENCES product_configurations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('variant', 'property')),
  required boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

-- Option values
CREATE TABLE option_values (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id uuid REFERENCES product_options(id) ON DELETE CASCADE,
  name text NOT NULL,
  price_modifier integer DEFAULT 0, -- in cents
  sku text, -- for variant options
  available boolean DEFAULT true,
  metadata jsonb DEFAULT '{}', -- for color, image, description etc
  created_at timestamp with time zone DEFAULT now()
);

-- API access logs for analytics
CREATE TABLE shopify_api_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  endpoint text NOT NULL,
  product_id text,
  shopify_domain text,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_product_configurations_shopify_id ON product_configurations(shopify_product_id);
CREATE INDEX idx_product_options_configuration ON product_options(configuration_id);
CREATE INDEX idx_option_values_option ON option_values(option_id);
CREATE INDEX idx_api_logs_created ON shopify_api_logs(created_at);

-- RLS Policies
ALTER TABLE product_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_api_logs ENABLE ROW LEVEL SECURITY;

-- Public read access for configurations (Shopify needs this)
CREATE POLICY "Public can read active product configurations" ON product_configurations
  FOR SELECT USING (active = true);

CREATE POLICY "Public can read product options" ON product_options
  FOR SELECT USING (true);

CREATE POLICY "Public can read option values" ON option_values
  FOR SELECT USING (true);

-- Only authenticated users can manage configurations
CREATE POLICY "Authenticated users can manage configurations" ON product_configurations
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage options" ON product_options
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage values" ON option_values
  FOR ALL USING (auth.role() = 'authenticated');

-- API logs are insert-only for public
CREATE POLICY "Public can insert API logs" ON shopify_api_logs
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can read API logs" ON shopify_api_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_product_configurations_updated_at BEFORE UPDATE
  ON product_configurations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();