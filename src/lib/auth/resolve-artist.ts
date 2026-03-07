import { createServiceClient } from "@/lib/supabase/server";
import { getLineUserId } from "@/lib/line/verify-token";

/**
 * Resolve the current artist from a request.
 * Requires valid LINE ID token in Authorization header.
 *
 * Returns { artistId, lineUserId } or null.
 */
export async function resolveArtist(
  request: Request
): Promise<{ artistId: string; lineUserId: string | null } | null> {
  const supabase = await createServiceClient();

  const lineUserId = await getLineUserId(request);
  if (!lineUserId) return null;

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
