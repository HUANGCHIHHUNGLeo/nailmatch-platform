import { describe, it, expect, vi } from "vitest";
import crypto from "crypto";
import { verifySignature } from "./webhook";

// Mock dependencies to prevent actual DB/LINE calls during import
vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn().mockResolvedValue({
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: null }),
        }),
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  }),
}));

vi.mock("./messaging", () => ({
  pushMessage: vi.fn(),
  pushFlexMessage: vi.fn(),
  notifyArtistWelcomeBack: vi.fn(),
  notifyHelperMenu: vi.fn(),
  notifyArtistsOfNewRequest: vi.fn(),
}));

vi.mock("./richmenu", () => ({
  linkArtistRichMenu: vi.fn(),
}));

describe("verifySignature", () => {
  const CHANNEL_SECRET = "test-secret-123";

  beforeAll(() => {
    vi.stubEnv("LINE_CHANNEL_SECRET", CHANNEL_SECRET);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("returns true for valid signature", () => {
    const body = JSON.stringify({ events: [] });
    const expected = crypto
      .createHmac("SHA256", CHANNEL_SECRET)
      .update(body)
      .digest("base64");

    expect(verifySignature(body, expected)).toBe(true);
  });

  it("returns false for invalid signature", () => {
    const body = JSON.stringify({ events: [] });
    expect(verifySignature(body, "invalid-signature")).toBe(false);
  });

  it("returns false for tampered body", () => {
    const originalBody = JSON.stringify({ events: [] });
    const signature = crypto
      .createHmac("SHA256", CHANNEL_SECRET)
      .update(originalBody)
      .digest("base64");

    const tamperedBody = JSON.stringify({ events: [{ type: "message" }] });
    expect(verifySignature(tamperedBody, signature)).toBe(false);
  });

  it("returns false for empty signature", () => {
    const body = JSON.stringify({ events: [] });
    expect(verifySignature(body, "")).toBe(false);
  });

  it("handles empty body", () => {
    const body = "";
    const expected = crypto
      .createHmac("SHA256", CHANNEL_SECRET)
      .update(body)
      .digest("base64");

    expect(verifySignature(body, expected)).toBe(true);
  });
});
