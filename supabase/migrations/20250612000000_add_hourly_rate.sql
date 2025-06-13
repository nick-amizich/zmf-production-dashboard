-- Add hourly_rate column to workers table
ALTER TABLE workers 
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(10,2) DEFAULT 25.00;