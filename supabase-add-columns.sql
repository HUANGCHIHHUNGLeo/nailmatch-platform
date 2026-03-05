-- Add new columns to artists table for enhanced registration
-- Run this in the Supabase SQL Editor

-- Artist role (nail or lash)
ALTER TABLE artists ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'nail';

-- Public LINE ID for contact/verification
ALTER TABLE artists ADD COLUMN IF NOT EXISTS line_id TEXT;

-- Verify columns were added
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'artists'
  AND column_name IN ('role', 'line_id')
ORDER BY column_name;
