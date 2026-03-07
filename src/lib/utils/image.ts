/**
 * Supabase Storage image optimization utility.
 *
 * Supabase supports on-the-fly image transforms via query params on the
 * `/render/image/public/` endpoint (or the `transform` option on the JS
 * client).  We generate optimised URLs so the browser only downloads the
 * size it actually needs, in WebP format.
 */

interface ImageTransformOptions {
  width?: number;
  height?: number;
  quality?: number;
  /** resize mode: cover (crop), contain (fit), or fill */
  resize?: "cover" | "contain" | "fill";
  format?: "webp" | "origin";
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

/**
 * Returns an optimised Supabase Storage URL with image transforms.
 * Falls back to the original URL for non-Supabase images.
 */
export function getOptimizedImageUrl(
  originalUrl: string,
  opts: ImageTransformOptions = {}
): string {
  if (!originalUrl) return originalUrl;

  // Only transform Supabase Storage URLs
  if (!originalUrl.includes("supabase.co/storage/")) {
    return originalUrl;
  }

  const {
    width,
    height,
    quality = 80,
    resize = "cover",
    format = "webp",
  } = opts;

  // Supabase transform URL pattern:
  // {project}.supabase.co/storage/v1/render/image/public/{bucket}/{path}?width=...&height=...
  const transformUrl = originalUrl.replace(
    "/storage/v1/object/public/",
    "/storage/v1/render/image/public/"
  );

  const params = new URLSearchParams();
  if (width) params.set("width", String(width));
  if (height) params.set("height", String(height));
  params.set("quality", String(quality));
  params.set("resize", resize);
  if (format !== "origin") params.set("format", format);

  const separator = transformUrl.includes("?") ? "&" : "?";
  return `${transformUrl}${separator}${params.toString()}`;
}

/** Common presets for the platform */
export const IMAGE_PRESETS = {
  /** Portfolio grid thumbnail (2-col grid) */
  portfolioThumb: { width: 400, height: 400, quality: 75 } as ImageTransformOptions,
  /** Portfolio detail / lightbox */
  portfolioFull: { width: 800, quality: 85 } as ImageTransformOptions,
  /** Artist avatar in cards */
  avatar: { width: 96, height: 96, quality: 75 } as ImageTransformOptions,
  /** Artist avatar large (profile page) */
  avatarLarge: { width: 200, height: 200, quality: 80 } as ImageTransformOptions,
  /** Reference image in request detail */
  reference: { width: 600, quality: 80 } as ImageTransformOptions,
  /** Reference thumbnail in form */
  referenceThumb: { width: 200, height: 200, quality: 70 } as ImageTransformOptions,
} as const;
