import { describe, it, expect } from "vitest";
import { getOptimizedImageUrl, IMAGE_PRESETS } from "./image";

describe("getOptimizedImageUrl", () => {
  const supabaseUrl =
    "https://abc123.supabase.co/storage/v1/object/public/portfolio-images/test.jpg";

  it("transforms Supabase storage URL to render URL with defaults", () => {
    const result = getOptimizedImageUrl(supabaseUrl);
    expect(result).toContain("/storage/v1/render/image/public/");
    expect(result).toContain("quality=80");
    expect(result).toContain("resize=cover");
    expect(result).toContain("format=webp");
  });

  it("includes width and height when specified", () => {
    const result = getOptimizedImageUrl(supabaseUrl, { width: 400, height: 400 });
    expect(result).toContain("width=400");
    expect(result).toContain("height=400");
  });

  it("applies custom quality", () => {
    const result = getOptimizedImageUrl(supabaseUrl, { quality: 60 });
    expect(result).toContain("quality=60");
  });

  it("applies custom resize mode", () => {
    const result = getOptimizedImageUrl(supabaseUrl, { resize: "contain" });
    expect(result).toContain("resize=contain");
  });

  it("omits format param when set to origin", () => {
    const result = getOptimizedImageUrl(supabaseUrl, { format: "origin" });
    expect(result).not.toContain("format=");
  });

  it("returns non-Supabase URLs unchanged", () => {
    const url = "https://example.com/photo.jpg";
    expect(getOptimizedImageUrl(url)).toBe(url);
  });

  it("returns LINE profile URLs unchanged", () => {
    const url = "https://profile.line-scdn.net/0h123abc";
    expect(getOptimizedImageUrl(url)).toBe(url);
  });

  it("returns empty string for empty input", () => {
    expect(getOptimizedImageUrl("")).toBe("");
  });

  it("handles URL with existing query params", () => {
    const urlWithParams = supabaseUrl + "?token=abc";
    const result = getOptimizedImageUrl(urlWithParams, { width: 200 });
    expect(result).toContain("width=200");
  });

  it("IMAGE_PRESETS have correct structure", () => {
    expect(IMAGE_PRESETS.portfolioThumb.width).toBe(400);
    expect(IMAGE_PRESETS.portfolioThumb.height).toBe(400);
    expect(IMAGE_PRESETS.avatar.width).toBe(96);
    expect(IMAGE_PRESETS.portfolioFull.width).toBe(800);
    expect(IMAGE_PRESETS.reference.width).toBe(600);
    expect(IMAGE_PRESETS.referenceThumb.width).toBe(200);
    expect(IMAGE_PRESETS.avatarLarge.width).toBe(200);
  });
});
