import { describe, it, expect, vi } from "vitest";
import { withRetry } from "./retry";

describe("withRetry", () => {
  it("returns result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const result = await withRetry(fn);
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("retries on retryable error and eventually succeeds", async () => {
    const err = Object.assign(new Error("server error"), { statusCode: 500 });
    const fn = vi
      .fn()
      .mockRejectedValueOnce(err)
      .mockRejectedValueOnce(err)
      .mockResolvedValue("ok");

    const result = await withRetry(fn, { maxRetries: 3, baseDelayMs: 1 });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it("retries on rate-limit (429)", async () => {
    const err = Object.assign(new Error("rate limited"), { statusCode: 429 });
    const fn = vi
      .fn()
      .mockRejectedValueOnce(err)
      .mockResolvedValue("done");

    const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 1 });
    expect(result).toBe("done");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("throws immediately on non-retryable error (e.g. 400)", async () => {
    const err = Object.assign(new Error("bad request"), { statusCode: 400 });
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { maxRetries: 3, baseDelayMs: 1 })).rejects.toThrow("bad request");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("throws immediately on non-retryable error (e.g. 403)", async () => {
    const err = Object.assign(new Error("forbidden"), { statusCode: 403 });
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { maxRetries: 3, baseDelayMs: 1 })).rejects.toThrow("forbidden");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("throws after exhausting all retries", async () => {
    const err = Object.assign(new Error("server error"), { statusCode: 502 });
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 1 })).rejects.toThrow("server error");
    expect(fn).toHaveBeenCalledTimes(3); // initial + 2 retries
  });

  it("retries on network errors (ECONNRESET)", async () => {
    const err = Object.assign(new Error("connection reset"), { code: "ECONNRESET" });
    const fn = vi
      .fn()
      .mockRejectedValueOnce(err)
      .mockResolvedValue("recovered");

    const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 1 });
    expect(result).toBe("recovered");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("retries on fetch failed errors", async () => {
    const err = new Error("fetch failed");
    const fn = vi
      .fn()
      .mockRejectedValueOnce(err)
      .mockResolvedValue("ok");

    const result = await withRetry(fn, { maxRetries: 1, baseDelayMs: 1 });
    expect(result).toBe("ok");
  });

  it("respects maxRetries = 0 (no retries)", async () => {
    const err = Object.assign(new Error("fail"), { statusCode: 500 });
    const fn = vi.fn().mockRejectedValue(err);

    await expect(withRetry(fn, { maxRetries: 0, baseDelayMs: 1 })).rejects.toThrow("fail");
    expect(fn).toHaveBeenCalledTimes(1);
  });
});
