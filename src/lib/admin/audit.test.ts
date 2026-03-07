import { describe, it, expect, vi, beforeEach } from "vitest";

const mockInsert = vi.fn().mockResolvedValue({ data: null, error: null });
const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn().mockResolvedValue({
    from: (...args: unknown[]) => mockFrom(...args),
  }),
}));

import { logAdminAction } from "./audit";

describe("logAdminAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserts audit log with all fields", async () => {
    await logAdminAction({
      action: "approve_artist",
      entityType: "artist",
      entityId: "uuid-123",
      details: { reason: "verified" },
      ip: "1.2.3.4",
    });

    expect(mockFrom).toHaveBeenCalledWith("audit_logs");
    expect(mockInsert).toHaveBeenCalledWith({
      action: "approve_artist",
      entity_type: "artist",
      entity_id: "uuid-123",
      details: { reason: "verified" },
      ip_address: "1.2.3.4",
    });
  });

  it("handles missing optional fields with null", async () => {
    await logAdminAction({ action: "login" });

    expect(mockInsert).toHaveBeenCalledWith({
      action: "login",
      entity_type: null,
      entity_id: null,
      details: {},
      ip_address: null,
    });
  });

  it("does not throw when insert fails", async () => {
    mockInsert.mockRejectedValueOnce(new Error("DB error"));

    // Should not throw
    await expect(
      logAdminAction({ action: "test", entityType: "test" })
    ).resolves.toBeUndefined();
  });

  it("logs different action types", async () => {
    const actions = ["approve_artist", "reject_artist", "revoke_artist", "login", "view_data"];

    for (const action of actions) {
      await logAdminAction({ action });
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({ action })
      );
    }
  });
});
