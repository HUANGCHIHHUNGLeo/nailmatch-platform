-- Booking Messages table for in-platform communication
CREATE TABLE IF NOT EXISTS booking_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'artist')),
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by booking
CREATE INDEX IF NOT EXISTS idx_booking_messages_booking_id ON booking_messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_booking_messages_created_at ON booking_messages(booking_id, created_at);

-- Customer contact visibility preference
-- Controls whether customer's phone is shown to the artist on confirmed bookings
ALTER TABLE customers ADD COLUMN IF NOT EXISTS show_contact_to_artist BOOLEAN DEFAULT false;
