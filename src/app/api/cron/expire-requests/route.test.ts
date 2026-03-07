import { describe, it, expect } from "vitest";

// Extract and test the calculateDeadline logic independently
// (We replicate the pure functions here since they're not exported)

function toTaiwanDateStr(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
}

function addDaysTW(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toTaiwanDateStr(d);
}

function calculateDeadline(
  preferredDate: string | null,
  preferredDateCustom: string | null,
  createdAt: string
): string | null {
  const created = new Date(createdAt);

  switch (preferredDate) {
    case "今天":
      return addDaysTW(created, 1);
    case "明天":
      return addDaysTW(created, 2);
    case "本週": {
      const twDay = new Date(
        created.toLocaleString("en-US", { timeZone: "Asia/Taipei" })
      ).getDay();
      const daysUntilSunday = 7 - twDay;
      return addDaysTW(created, daysUntilSunday + 1);
    }
    case "其他日期": {
      if (preferredDateCustom) {
        const d = new Date(preferredDateCustom + "T00:00:00+08:00");
        return addDaysTW(d, 1);
      }
      return addDaysTW(created, 7);
    }
    default:
      return addDaysTW(created, 7);
  }
}

describe("calculateDeadline", () => {
  // Use a fixed Taiwan-time Wednesday: 2026-03-04 10:00 UTC = 2026-03-04 18:00 TW
  const wednesday = "2026-03-04T10:00:00Z";

  it("今天 → expires 1 day after creation", () => {
    const result = calculateDeadline("今天", null, wednesday);
    expect(result).toBe("2026-03-05");
  });

  it("明天 → expires 2 days after creation", () => {
    const result = calculateDeadline("明天", null, wednesday);
    expect(result).toBe("2026-03-06");
  });

  it("本週 → expires Monday after the week ends", () => {
    // Wednesday → Sunday is 4 days away, +1 = Monday
    const result = calculateDeadline("本週", null, wednesday);
    expect(result).toBe("2026-03-09"); // Monday
  });

  it("其他日期 with custom date → expires day after custom date", () => {
    const result = calculateDeadline("其他日期", "2026-03-15", wednesday);
    expect(result).toBe("2026-03-16");
  });

  it("其他日期 without custom date → 7 days", () => {
    const result = calculateDeadline("其他日期", null, wednesday);
    expect(result).toBe("2026-03-11");
  });

  it("default (null) → 7 days", () => {
    const result = calculateDeadline(null, null, wednesday);
    expect(result).toBe("2026-03-11");
  });

  it("handles late-night UTC that is next day in Taiwan", () => {
    // 2026-03-04 23:00 UTC = 2026-03-05 07:00 TW
    const lateUtc = "2026-03-04T23:00:00Z";
    const result = calculateDeadline("今天", null, lateUtc);
    // In Taiwan time, creation is March 5th, so +1 = March 6th
    expect(result).toBe("2026-03-06");
  });
});

describe("toTaiwanDateStr", () => {
  it("outputs YYYY-MM-DD format", () => {
    const d = new Date("2026-03-04T10:00:00Z");
    const result = toTaiwanDateStr(d);
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("correctly converts UTC to Taiwan time", () => {
    // 2026-03-04 20:00 UTC = 2026-03-05 04:00 TW
    const d = new Date("2026-03-04T20:00:00Z");
    expect(toTaiwanDateStr(d)).toBe("2026-03-05");
  });
});
