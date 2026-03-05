import { createServiceClient } from "@/lib/supabase/server";
import { getLineUserId } from "@/lib/line/verify-token";

/**
 * Resolve the current artist from a request.
 * 1. Try LINE ID token from Authorization header
 * 2. Dev fallback: return first active artist (only in development)
 *
 * Returns { artistId, lineUserId } or null.
 */
export async function resolveArtist(
  request: Request
): Promise<{ artistId: string; lineUserId: string | null } | null> {
  const supabase = await createServiceClient();

  // 1. Try LINE token auth
  const lineUserId = getLineUserId(request);
  if (lineUserId) {
    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("line_user_id", lineUserId)
      .single();

    if (artist) {
      return { artistId: artist.id, lineUserId };
    }
    return null;
  }

  // 2. Dev fallback only
  if (process.env.NODE_ENV === "development") {
    const { data: artist } = await supabase
      .from("artists")
      .select("id")
      .eq("is_active", true)
      .limit(1)
      .single();

    if (artist) {
      return { artistId: artist.id, lineUserId: null };
    }
  }

  return null;
}
