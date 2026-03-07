import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, getClientIp } from "./rate-limit";

describe("checkRateLimit", () => {
  // Use unique keys per test to avoid cross-contamination
  let keyIdx = 0;
  const uniqueKey = () => `test-key-${Date.now()}-${keyIdx++}`;

  it("allows requests within limit", () => {
    const key = uniqueKey();
    const r1 = checkRateLimit(key, { windowMs: 60_000, max: 3 });
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
  });

  it("blocks requests exceeding limit", () => {
    const key = uniqueKey();
    checkRateLimit(key, { windowMs: 60_000, max: 2 });
    checkRateLimit(key, { windowMs: 60_000, max: 2 });
    const r3 = checkRateLimit(key, { windowMs: 60_000, max: 2 });
    expect(r3.allowed).toBe(false);
    expect(r3.remaining).toBe(0);
  });

  it("resets after window expires", () => {
    const key = uniqueKey();
    // Use a very short window
    checkRateLimit(key, { windowMs: 1, max: 1 });
    // Wait 2ms to ensure window has expired
    const start = Date.now();
    while (Date.now() - start < 5) {
      /* spin */
    }
    const r2 = checkRateLimit(key, { windowMs: 1, max: 1 });
    expect(r2.allowed).toBe(true);
  });

  it("uses default config when none provided", () => {
    const key = uniqueKey();
    const r = checkRateLimit(key);
    expect(r.allowed).toBe(true);
    expect(r.remaining).toBe(29); // default max = 30
  });

  it("returns resetAt timestamp", () => {
    const key = uniqueKey();
    const before = Date.now();
    const r = checkRateLimit(key, { windowMs: 60_000, max: 5 });
    expect(r.resetAt).toBeGreaterThanOrEqual(before + 60_000);
  });
});

describe("getClientIp", () => {
  it("extracts IP from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(req)).toBe("1.2.3.4");
  });

  it("extracts IP from x-real-ip", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "10.0.0.1" },
    });
    expect(getClientIp(req)).toBe("10.0.0.1");
  });

  it("returns 'unknown' when no IP headers", () => {
    const req = new Request("http://localhost");
    expect(getClientIp(req)).toBe("unknown");
  });
});
