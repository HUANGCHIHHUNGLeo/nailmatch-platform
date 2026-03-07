import { NextResponse } from "next/server";
import { verifyLineIdToken } from "@/lib/line/verify-token";

/**
 * Diagnostic endpoint — checks auth configuration.
 * DELETE THIS after debugging is complete.
 */
export async function POST(request: Request) {
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;

  const checks: Record<string, unknown> = {
    LINE_LOGIN_CHANNEL_ID_set: !!channelId,
    LINE_LOGIN_CHANNEL_ID_length: channelId?.length || 0,
    LINE_LOGIN_CHANNEL_SECRET_set: !!channelSecret,
    LINE_LOGIN_CHANNEL_SECRET_length: channelSecret?.length || 0,
  };

  // Try verifying the token from Authorization header
  const authHeader = request.headers.get("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    const parts = token.split(".");
    checks.token_parts = parts.length;

    if (parts.length === 3) {
      try {
        const payload = JSON.parse(Buffer.from(parts[1], "base64url").toString());
        checks.token_aud = payload.aud;
        checks.token_iss = payload.iss;
        checks.token_exp = payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
        checks.token_sub_exists = !!payload.sub;
        checks.aud_matches_channel_id = payload.aud === channelId;
        checks.token_expired = payload.exp ? payload.exp < Date.now() / 1000 : "no exp";
      } catch {
        checks.token_decode_error = true;
      }

      const result = verifyLineIdToken(token);
      checks.verify_result = result ? "success" : "failed";
      if (result) checks.user_id_prefix = result.userId.substring(0, 5) + "...";
    }
  } else {
    checks.auth_header = "missing or invalid";
  }

  return NextResponse.json(checks);
}
