import { describe, it, expect } from "vitest";
import { parsePagination, paginatedResponse } from "./pagination";

describe("parsePagination", () => {
  it("returns defaults when no params", () => {
    const params = new URLSearchParams();
    const result = parsePagination(params);
    expect(result).toEqual({ page: 1, limit: 20, from: 0, to: 19 });
  });

  it("parses page and limit from params", () => {
    const params = new URLSearchParams({ page: "3", limit: "10" });
    const result = parsePagination(params);
    expect(result).toEqual({ page: 3, limit: 10, from: 20, to: 29 });
  });

  it("clamps page minimum to 1", () => {
    const params = new URLSearchParams({ page: "-5" });
    const result = parsePagination(params);
    expect(result.page).toBe(1);
  });

  it("clamps limit to 1-100 range", () => {
    const tooHigh = new URLSearchParams({ limit: "999" });
    expect(parsePagination(tooHigh).limit).toBe(100);

    const tooLow = new URLSearchParams({ limit: "0" });
    expect(parsePagination(tooLow).limit).toBe(1);
  });

  it("accepts custom defaults", () => {
    const params = new URLSearchParams();
    const result = parsePagination(params, { page: 2, limit: 50 });
    expect(result).toEqual({ page: 2, limit: 50, from: 50, to: 99 });
  });
});

describe("paginatedResponse", () => {
  it("builds correct response with hasMore=true", () => {
    const data = [1, 2, 3];
    const result = paginatedResponse(data, 30, 1, 10);
    expect(result).toEqual({
      data: [1, 2, 3],
      total: 30,
      page: 1,
      limit: 10,
      hasMore: true,
    });
  });

  it("sets hasMore=false on last page", () => {
    const data = [1, 2];
    const result = paginatedResponse(data, 12, 2, 10);
    expect(result.hasMore).toBe(false);
  });

  it("sets hasMore=false when exact fit", () => {
    const result = paginatedResponse([], 10, 1, 10);
    expect(result.hasMore).toBe(false);
  });
});
