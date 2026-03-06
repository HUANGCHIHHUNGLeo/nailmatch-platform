/**
 * 簡易 in-memory rate limiter（適用 Vercel Serverless）
 *
 * 原理：每個 IP 記錄最近的請求時間戳，
 *       超過 windowMs 內的 max 次數就回傳 429。
 *
 * 注意：Vercel Serverless 每個 function instance 有獨立記憶體，
 *       所以這不是全域精確的限制，但已足夠擋住大部分濫用。
 */

interface RateLimitEntry {
  timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// 定期清理過期記錄，避免記憶體洩漏
const CLEANUP_INTERVAL = 60_000; // 1 分鐘
let lastCleanup = Date.now();

function cleanup(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  const cutoff = now - windowMs;
  for (const [key, entry] of store) {
    entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
    if (entry.timestamps.length === 0) {
      store.delete(key);
    }
  }
}

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
 * 檢查某個 key（通常是 IP）是否超過速率限制
 */
export function checkRateLimit(
  key: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const { windowMs = 60_000, max = 30 } = config;
  const now = Date.now();

  cleanup(windowMs);

  const entry = store.get(key) || { timestamps: [] };

  // 移除窗口外的舊記錄
  const cutoff = now - windowMs;
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

  const allowed = entry.timestamps.length < max;

  if (allowed) {
    entry.timestamps.push(now);
  }

  store.set(key, entry);

  return {
    allowed,
    remaining: Math.max(0, max - entry.timestamps.length),
    resetAt: entry.timestamps.length > 0
      ? entry.timestamps[0] + windowMs
      : now + windowMs,
  };
}

/**
 * 從 Request 取得使用者 IP
 */
export function getClientIp(request: Request): string {
  const headers = new Headers(request.headers);
  // Vercel / Cloudflare 會設這些 header
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "unknown"
  );
}
