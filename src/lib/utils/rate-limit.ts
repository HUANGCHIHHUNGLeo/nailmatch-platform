/**
 * 混合式 Rate Limiter
 *
 * 1. In-memory 快速攔截（同 instance 內的爆量）
 * 2. Supabase DB 跨 instance 精確計數（Serverless cold start 也有效）
 *
 * 使用 Supabase 的 rate_limits 表，不需要額外付費。
 */

import { createServiceClient } from "@/lib/supabase/server";

// ── In-memory 快速層 ────────────────────────────────────────
interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60_000;
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) store.delete(key);
  }
}

// ── 公開 API ────────────────────────────────────────────────

interface RateLimitConfig {
  /** 時間窗口（毫秒），預設 60 秒 */
  windowMs?: number;
  /** 窗口內最大請求數，預設 30 */
  max?: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * 檢查速率限制（in-memory 快速版，同 instance 有效）
 * 適合大部分場景：擋同一 IP 的連續快速請求
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const { windowMs = 60_000, max = 30 } = config;
  const now = Date.now();
  cleanup(windowMs);

  const entry = store.get(key) || { timestamps: [] };
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  const allowed = entry.timestamps.length < max;
  if (allowed) entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed,
    remaining: Math.max(0, max - entry.timestamps.length),
    resetAt: entry.timestamps.length > 0 ? entry.timestamps[0] + windowMs : now + windowMs,
  };
}

/**
 * Supabase-backed 跨 instance 精確限流
 * 使用 rate_limits 表做滑動窗口計數
 * 適合關鍵操作（送出需求、送出報價）
 */
export async function checkRateLimitDB(
  key: string,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  const { windowMs = 60_000, max = 30 } = config;
  const now = Date.now();

  // In-memory 先擋一輪（減少 DB 查詢）
  const memResult = checkRateLimit(key, config);
  if (!memResult.allowed) return memResult;

  try {
    const supabase = await createServiceClient();
    const windowStart = new Date(now - windowMs).toISOString();

    // 清理舊記錄 + 計數（單次 RPC）
    await supabase
      .from("rate_limits")
      .delete()
      .eq("key", key)
      .lt("created_at", windowStart);

    const { count } = await supabase
      .from("rate_limits")
      .select("id", { count: "exact", head: true })
      .eq("key", key)
      .gte("created_at", windowStart);

    const currentCount = count || 0;
    const allowed = currentCount < max;

    if (allowed) {
      await supabase
        .from("rate_limits")
        .insert({ key, created_at: new Date(now).toISOString() });
    }

    return {
      allowed,
      remaining: Math.max(0, max - currentCount - (allowed ? 1 : 0)),
      resetAt: now + windowMs,
    };
  } catch (err) {
    // DB 失敗時 fallback 到 in-memory 結果（不要因為限流系統壞掉而擋住用戶）
    console.error("Rate limit DB check failed, using in-memory fallback:", err);
    return memResult;
  }
}

/**
 * 從 Request 取得使用者 IP
 */
export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
