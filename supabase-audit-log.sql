-- ===========================================
-- NailMatch: Audit Logs table
-- Run this in Supabase SQL Editor
-- ===========================================

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,           -- e.g. 'artist.approve', 'artist.reject', 'admin.login'
  entity_type TEXT,               -- e.g. 'artist', 'booking', 'richmenu'
  entity_id TEXT,                 -- ID of the affected entity
  details JSONB DEFAULT '{}',     -- Additional context (artist name, etc.)
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);

-- RLS: only service role can read/write
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on audit_logs"
  ON audit_logs
  FOR ALL
  USING (true)
  WITH CHECK (true);
