import { describe, it, expect, vi, beforeEach } from "vitest";
import { getLineUserId, verifyLineIdToken } from "./verify-token";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

describe("verifyLineIdToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("LINE_LOGIN_CHANNEL_ID", "test-channel-id");
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("returns userId on successful verification", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sub: "U123abc" }),
    });

    const result = await verifyLineIdToken("valid-token");
    expect(result).toEqual({ userId: "U123abc" });
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api.line.me/oauth2/v2.1/verify",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("returns null when LINE API rejects token", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "invalid_token" }),
    });

    const result = await verifyLineIdToken("invalid-token");
    expect(result).toBeNull();
  });

  it("returns null when response has no sub field", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ iss: "something", aud: "something" }),
    });

    const result = await verifyLineIdToken("token-without-sub");
    expect(result).toBeNull();
  });

  it("returns null when LINE_LOGIN_CHANNEL_ID is not set", async () => {
    vi.stubEnv("LINE_LOGIN_CHANNEL_ID", "");
    const result = await verifyLineIdToken("some-token");
    expect(result).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns null on network error", async () => {
    mockFetch.mockRejectedValue(new Error("network error"));
    const result = await verifyLineIdToken("some-token");
    expect(result).toBeNull();
  });
});

describe("getLineUserId", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("LINE_LOGIN_CHANNEL_ID", "test-channel-id");
  });

  it("extracts token from Authorization header and verifies", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ sub: "U456def" }),
    });

    const req = new Request("http://localhost", {
      headers: { Authorization: "Bearer my-id-token" },
    });

    const userId = await getLineUserId(req);
    expect(userId).toBe("U456def");
  });

  it("returns null when no Authorization header", async () => {
    const req = new Request("http://localhost");
    const userId = await getLineUserId(req);
    expect(userId).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns null when Authorization is not Bearer", async () => {
    const req = new Request("http://localhost", {
      headers: { Authorization: "Basic abc123" },
    });

    const userId = await getLineUserId(req);
    expect(userId).toBeNull();
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("returns null when token verification fails", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "invalid" }),
    });

    const req = new Request("http://localhost", {
      headers: { Authorization: "Bearer bad-token" },
    });

    const userId = await getLineUserId(req);
    expect(userId).toBeNull();
  });
});
