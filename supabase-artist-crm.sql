CREATE TABLE IF NOT EXISTS artist_customer_notes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  note TEXT,
  tags TEXT[] DEFAULT '{}',
  last_service_date DATE,
  visit_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(artist_id, customer_id)
);
CREATE INDEX IF NOT EXISTS idx_artist_customer_notes_artist ON artist_customer_notes(artist_id);
