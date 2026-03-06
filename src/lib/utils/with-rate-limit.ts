import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "./rate-limit";

interface RateLimitOptions {
  /** 時間窗口（毫秒），預設 60 秒 */
  windowMs?: number;
  /** 窗口內最大請求數，預設 30 */
  max?: number;
  /** 限制鍵的前綴（區分不同 endpoint） */
  prefix?: string;
}

/**
 * 對 API route handler 套用 rate limiting。
 * 超過限制回傳 429 Too Many Requests。
 *
 * 用法：
 * ```ts
 * export const POST = withRateLimit(async (request) => {
 *   // 你的邏輯
 * }, { max: 10, windowMs: 60_000 });
 * ```
 */
export function withRateLimit<T extends Request>(
  handler: (request: T) => Promise<Response>,
  options: RateLimitOptions = {}
): (request: T) => Promise<Response> {
  const { windowMs = 60_000, max = 30, prefix = "" } = options;

  return async (request: T) => {
    const ip = getClientIp(request);
    const key = prefix ? `${prefix}:${ip}` : ip;
    const result = checkRateLimit(key, { windowMs, max });

    if (!result.allowed) {
      return NextResponse.json(
        { error: "請求過於頻繁，請稍後再試" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((result.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(max),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const response = await handler(request);
    return response;
  };
}
