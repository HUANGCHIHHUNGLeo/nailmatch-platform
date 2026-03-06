-- Add consent tracking columns to customers
ALTER TABLE customers ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

-- Add consent tracking columns to artists
ALTER TABLE artists ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ;
ALTER TABLE artists ADD COLUMN IF NOT EXISTS privacy_accepted_at TIMESTAMPTZ;

-- Add contact info and consent to service_requests
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS consented_at TIMESTAMPTZ;
