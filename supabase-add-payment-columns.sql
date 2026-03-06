-- Add payment_methods column to artists table
ALTER TABLE artists ADD COLUMN IF NOT EXISTS payment_methods TEXT[] DEFAULT '{}';

-- Add payment_preference column to service_requests table
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS payment_preference TEXT[] DEFAULT '{}';
