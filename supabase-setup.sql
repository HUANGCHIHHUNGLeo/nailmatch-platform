-- ===========================================
-- NailMatch: Reviews table + RLS policies
-- Run this in Supabase SQL Editor
-- ===========================================

-- 1. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
  artist_id UUID NOT NULL REFERENCES artists(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast artist rating lookups
CREATE INDEX IF NOT EXISTS idx_reviews_artist_id ON reviews(artist_id);

-- 2. RLS Policies
-- Enable RLS on all tables
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_works ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS (our API uses service role key)
-- These policies allow the service_role to do everything
CREATE POLICY "Service role full access" ON artists FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON service_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON artist_responses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON portfolio_works FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON availability_slots FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access" ON reviews FOR ALL USING (true) WITH CHECK (true);

-- Anon key: read-only access to public artist data
CREATE POLICY "Anon can view verified artists" ON artists
  FOR SELECT USING (is_verified = true AND is_active = true);

CREATE POLICY "Anon can view portfolio works" ON portfolio_works
  FOR SELECT USING (true);

CREATE POLICY "Anon can view reviews" ON reviews
  FOR SELECT USING (true);
