-- ============================================
-- Performance indexes for NailMatch Platform
-- Run in Supabase SQL Editor
-- ============================================

-- Artists: matching query (is_active + is_verified)
CREATE INDEX IF NOT EXISTS idx_artists_active_verified
  ON artists (is_active, is_verified);

-- Artists: GIN index for cities array overlap matching
CREATE INDEX IF NOT EXISTS idx_artists_cities_gin
  ON artists USING GIN (cities);

-- Service Requests: customer lookup
CREATE INDEX IF NOT EXISTS idx_service_requests_customer_id
  ON service_requests (customer_id);

-- Service Requests: status + created_at for lobby/matching queries
CREATE INDEX IF NOT EXISTS idx_service_requests_status_created
  ON service_requests (status, created_at DESC);

-- Service Requests: GIN index for locations array overlap
CREATE INDEX IF NOT EXISTS idx_service_requests_locations_gin
  ON service_requests USING GIN (locations);

-- Artist Responses: lookup by request
CREATE INDEX IF NOT EXISTS idx_artist_responses_request_id
  ON artist_responses (request_id);

-- Artist Responses: lookup by artist
CREATE INDEX IF NOT EXISTS idx_artist_responses_artist_id
  ON artist_responses (artist_id);

-- Bookings: customer lookup
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id
  ON bookings (customer_id);

-- Bookings: artist lookup
CREATE INDEX IF NOT EXISTS idx_bookings_artist_id
  ON bookings (artist_id);

-- Bookings: status filter
CREATE INDEX IF NOT EXISTS idx_bookings_status
  ON bookings (status);

-- Portfolio Works: artist lookup
CREATE INDEX IF NOT EXISTS idx_portfolio_works_artist_id
  ON portfolio_works (artist_id);

-- Availability Slots: artist + date for calendar queries
CREATE INDEX IF NOT EXISTS idx_availability_slots_artist_date
  ON availability_slots (artist_id, date);

-- Reviews: artist lookup for rating aggregation
CREATE INDEX IF NOT EXISTS idx_reviews_artist_id
  ON reviews (artist_id);

-- Booking Messages: booking lookup for chat
CREATE INDEX IF NOT EXISTS idx_booking_messages_booking_id
  ON booking_messages (booking_id, created_at);
