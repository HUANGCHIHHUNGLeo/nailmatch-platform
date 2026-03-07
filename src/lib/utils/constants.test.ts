import { describe, it, expect } from "vitest";
import {
  LOCATION_GROUPS,
  LOCATIONS,
  NAIL_SERVICES,
  LASH_SERVICES,
  hasNailServices,
  hasLashServices,
  BUDGET_RANGES,
  REQUEST_STATUS,
} from "./constants";

describe("LOCATIONS", () => {
  it("flattens enabled location groups", () => {
    expect(LOCATIONS.length).toBeGreaterThan(0);
    expect(LOCATIONS).toContain("台北市 大安區");
    expect(LOCATIONS).toContain("高雄市 前金區");
  });

  it("excludes disabled groups (桃園市)", () => {
    const hasDisabled = LOCATIONS.some((l) => l.startsWith("桃園市"));
    expect(hasDisabled).toBe(false);
  });

  it("includes 其他 group without city prefix", () => {
    expect(LOCATIONS).toContain("到府服務");
    expect(LOCATIONS).toContain("店面服務");
  });
});

describe("hasNailServices / hasLashServices", () => {
  it("detects nail services by label", () => {
    expect(hasNailServices(["單色凝膠", "其他"])).toBe(true);
    expect(hasNailServices(["法式美甲"])).toBe(true);
  });

  it("returns false for lash-only services", () => {
    expect(hasNailServices(["自然款嫁接"])).toBe(false);
  });

  it("detects lash services by label", () => {
    expect(hasLashServices(["自然款嫁接"])).toBe(true);
    expect(hasLashServices(["角蛋白翹睫術"])).toBe(true);
  });

  it("returns false for nail-only services", () => {
    expect(hasLashServices(["單色凝膠"])).toBe(false);
  });

  it("returns false for empty array", () => {
    expect(hasNailServices([])).toBe(false);
    expect(hasLashServices([])).toBe(false);
  });
});

describe("NAIL_SERVICES / LASH_SERVICES", () => {
  it("has unique values", () => {
    const nailValues = NAIL_SERVICES.map((s) => s.value);
    expect(new Set(nailValues).size).toBe(nailValues.length);

    const lashValues = LASH_SERVICES.map((s) => s.value);
    expect(new Set(lashValues).size).toBe(lashValues.length);
  });

  it("no overlap between nail and lash values", () => {
    const nailValues = new Set(NAIL_SERVICES.map((s) => s.value));
    const overlap = LASH_SERVICES.filter((s) => nailValues.has(s.value));
    expect(overlap).toHaveLength(0);
  });
});

describe("BUDGET_RANGES", () => {
  it("has at least 5 options", () => {
    expect(BUDGET_RANGES.length).toBeGreaterThanOrEqual(5);
  });

  it("has unique values", () => {
    const values = BUDGET_RANGES.map((b) => b.value);
    expect(new Set(values).size).toBe(values.length);
  });
});

describe("REQUEST_STATUS", () => {
  it("contains all expected statuses", () => {
    const keys = Object.keys(REQUEST_STATUS);
    expect(keys).toContain("pending");
    expect(keys).toContain("matching");
    expect(keys).toContain("confirmed");
    expect(keys).toContain("completed");
    expect(keys).toContain("cancelled");
    expect(keys).toContain("expired");
  });

  it("each status has label and color", () => {
    for (const status of Object.values(REQUEST_STATUS)) {
      expect(status.label).toBeTruthy();
      expect(status.color).toBeTruthy();
    }
  });
});
