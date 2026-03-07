import { describe, it, expect } from "vitest";
import { parsePagination, paginatedResponse } from "./pagination";

describe("parsePagination — edge cases", () => {
  it("clamps negative page to 1", () => {
    const params = new URLSearchParams({ page: "-5" });
    const result = parsePagination(params);
    expect(result.page).toBe(1);
    expect(result.from).toBe(0);
  });

  it("clamps limit above 100 to 100", () => {
    const params = new URLSearchParams({ limit: "500" });
    const result = parsePagination(params);
    expect(result.limit).toBe(100);
  });

  it("clamps limit below 1 to 1", () => {
    const params = new URLSearchParams({ limit: "0" });
    const result = parsePagination(params);
    expect(result.limit).toBe(1);
  });

  it("handles NaN values (falls through to Math.max)", () => {
    const params = new URLSearchParams({ page: "abc", limit: "xyz" });
    const result = parsePagination(params);
    // parseInt("abc") = NaN, Math.max(1, NaN) = NaN — this is a known edge case
    // The function doesn't guard against NaN, so we document this behavior
    expect(Number.isNaN(result.page)).toBe(true);
  });

  it("uses custom defaults", () => {
    const params = new URLSearchParams();
    const result = parsePagination(params, { page: 3, limit: 50 });
    expect(result.page).toBe(3);
    expect(result.limit).toBe(50);
    expect(result.from).toBe(100);
    expect(result.to).toBe(149);
  });

  it("calculates correct range for page 2", () => {
    const params = new URLSearchParams({ page: "2", limit: "10" });
    const result = parsePagination(params);
    expect(result.from).toBe(10);
    expect(result.to).toBe(19);
  });

  it("calculates correct range for page 5, limit 25", () => {
    const params = new URLSearchParams({ page: "5", limit: "25" });
    const result = parsePagination(params);
    expect(result.from).toBe(100);
    expect(result.to).toBe(124);
  });
});

describe("paginatedResponse", () => {
  it("returns correct structure", () => {
    const result = paginatedResponse(["a", "b", "c"], 10, 1, 3);
    expect(result).toEqual({
      data: ["a", "b", "c"],
      total: 10,
      page: 1,
      limit: 3,
      hasMore: true,
    });
  });

  it("hasMore is false on last page", () => {
    const result = paginatedResponse(["a", "b"], 5, 3, 2);
    expect(result.hasMore).toBe(false);
  });

  it("hasMore is false when exactly on boundary", () => {
    const result = paginatedResponse(["a"], 10, 10, 1);
    expect(result.hasMore).toBe(false);
  });

  it("handles empty data", () => {
    const result = paginatedResponse([], 0, 1, 20);
    expect(result.data).toEqual([]);
    expect(result.hasMore).toBe(false);
  });

  it("hasMore is true when more pages exist", () => {
    const result = paginatedResponse(["x"], 100, 1, 20);
    expect(result.hasMore).toBe(true);
  });
});
