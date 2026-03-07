-- ============================================
-- Rate Limits 表（跨 Serverless instance 精確限流）
-- Run in Supabase SQL Editor
-- ============================================

CREATE TABLE IF NOT EXISTS rate_limits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 查詢用索引：按 key + 時間窗口查找
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_created
  ON rate_limits (key, created_at DESC);

-- 自動清理 7 天以上的舊記錄（避免表無限增長）
-- 如果你的 Supabase 有 pg_cron，可以用這個；沒有的話靠程式碼清理也行
-- SELECT cron.schedule('cleanup-rate-limits', '0 3 * * *', $$DELETE FROM rate_limits WHERE created_at < now() - interval '7 days'$$);
