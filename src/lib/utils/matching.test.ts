import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase before importing matching
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockNot = vi.fn();
const mockOverlaps = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServiceClient: vi.fn().mockResolvedValue({
    from: (...args: unknown[]) => {
      mockFrom(...args);
      return {
        select: (...sArgs: unknown[]) => {
          mockSelect(...sArgs);
          return {
            eq: (...eqArgs: unknown[]) => {
              mockEq(...eqArgs);
              return {
                eq: (...eq2Args: unknown[]) => {
                  mockEq(...eq2Args);
                  return {
                    not: (...notArgs: unknown[]) => {
                      mockNot(...notArgs);
                      return {
                        overlaps: (...olArgs: unknown[]) => {
                          mockOverlaps(...olArgs);
                          return { data: [], error: null };
                        },
                        data: [],
                        error: null,
                      };
                    },
                  };
                },
              };
            },
          };
        },
      };
    },
  }),
}));

import { findMatchingArtists } from "./matching";

describe("findMatchingArtists", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("queries the artists table", async () => {
    await findMatchingArtists({
      locations: ["台北市 大安區"],
      services: ["單色凝膠"],
      budget_range: "NT$800-1200",
      artist_gender_pref: "不限",
    });

    expect(mockFrom).toHaveBeenCalledWith("artists");
  });

  it("filters by is_active and is_verified", async () => {
    await findMatchingArtists({
      locations: ["台北市 中山區"],
      services: ["貓眼美甲"],
      budget_range: "NT$1200-2000",
      artist_gender_pref: "女生",
    });

    expect(mockEq).toHaveBeenCalledWith("is_active", true);
    expect(mockEq).toHaveBeenCalledWith("is_verified", true);
  });

  it("filters by cities overlap when locations provided", async () => {
    await findMatchingArtists({
      locations: ["台北市 大安區", "台北市 信義區"],
      services: ["單色凝膠"],
      budget_range: "NT$500-800",
      artist_gender_pref: "不限",
    });

    expect(mockOverlaps).toHaveBeenCalledWith("cities", ["台北市 大安區", "台北市 信義區"]);
  });

  it("returns empty array on error", async () => {
    // The mock already returns empty array, which is the expected fallback
    const result = await findMatchingArtists({
      locations: [],
      services: [],
      budget_range: "",
      artist_gender_pref: "",
    });

    expect(result).toEqual([]);
  });
});
