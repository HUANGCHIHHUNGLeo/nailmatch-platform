-- Disputes table for handling customer/artist disputes
CREATE TABLE IF NOT EXISTS disputes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  reporter_type TEXT NOT NULL CHECK (reporter_type IN ('customer', 'artist')),
  reporter_id UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolution TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_disputes_booking ON disputes(booking_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);

-- RLS
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON disputes FOR ALL USING (true) WITH CHECK (true);
