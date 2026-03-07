/**
 * Retry wrapper for LINE Messaging API calls.
 *
 * LINE Push API can transiently fail (rate-limit 429, server error 500/502).
 * This utility wraps any async call with exponential back-off retries so
 * notifications are not silently lost.
 */

interface RetryOptions {
  /** Max number of retry attempts (default: 3) */
  maxRetries?: number;
  /** Base delay in ms before first retry (default: 1000) */
  baseDelayMs?: number;
  /** Jitter factor 0-1 added to each delay (default: 0.3) */
  jitter?: number;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelayMs: 1_000,
  jitter: 0.3,
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;

  // LINE SDK wraps HTTP errors with statusCode
  const statusCode = (err as { statusCode?: number }).statusCode;
  if (statusCode === 429) return true; // rate limited
  if (statusCode && statusCode >= 500) return true; // server error

  // Network errors
  const code = (err as { code?: string }).code;
  if (code === "ECONNRESET" || code === "ETIMEDOUT" || code === "ENOTFOUND") return true;

  const message = (err as { message?: string }).message || "";
  if (message.includes("fetch failed") || message.includes("network")) return true;

  return false;
}

/**
 * Execute an async function with retry on transient failures.
 *
 * Usage:
 *   await withRetry(() => pushMessage(userId, text));
 *   await withRetry(() => client.multicast({ to, messages }), { maxRetries: 2 });
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  opts?: RetryOptions
): Promise<T> {
  const { maxRetries, baseDelayMs, jitter } = { ...DEFAULT_OPTIONS, ...opts };

  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      if (attempt >= maxRetries || !isRetryable(err)) {
        throw err;
      }

      // Exponential back-off with jitter
      const delay = baseDelayMs * Math.pow(2, attempt) * (1 + jitter * Math.random());
      console.warn(
        `[LINE Retry] Attempt ${attempt + 1}/${maxRetries} failed, retrying in ${Math.round(delay)}ms:`,
        err instanceof Error ? err.message : err
      );
      await sleep(delay);
    }
  }

  throw lastError;
}
