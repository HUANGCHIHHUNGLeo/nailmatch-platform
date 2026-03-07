import { NextResponse } from "next/server";
import crypto from "crypto";
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
    LINE_LOGIN_CHANNEL_SECRET_prefix: channelSecret?.substring(0, 4) || "",
  };

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    checks.auth_header = "missing or invalid";
    return NextResponse.json(checks);
  }

  const token = authHeader.slice(7);
  const parts = token.split(".");
  checks.token_parts = parts.length;

  if (parts.length !== 3) {
    return NextResponse.json(checks);
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    checks.token_aud = payload.aud;
    checks.token_iss = payload.iss;
    checks.token_exp = payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
    checks.token_sub_exists = !!payload.sub;
    checks.aud_matches_channel_id = payload.aud === channelId;
    checks.token_expired = payload.exp ? payload.exp < Date.now() / 1000 : "no exp";
  } catch {
    checks.token_decode_error = true;
  }

  // Signature comparison details
  if (channelSecret) {
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = crypto
      .createHmac("sha256", channelSecret)
      .update(data)
      .digest("base64url");
    checks.sig_actual_prefix = signatureB64.substring(0, 10);
    checks.sig_expected_prefix = expectedSig.substring(0, 10);
    checks.sig_match = signatureB64 === expectedSig;
  }

  // Local verify
  const result = verifyLineIdToken(token);
  checks.local_verify = result ? "success" : "failed";
  if (result) checks.user_id_prefix = result.userId.substring(0, 8) + "...";

  // LINE official verify API
  try {
    const lineRes = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id_token: token, client_id: channelId || "" }),
    });
    const lineData = await lineRes.json();
    checks.line_api_status = lineRes.status;
    checks.line_api_result = lineRes.ok ? "valid" : lineData.error_description || lineData.error || "invalid";
    if (lineRes.ok && lineData.sub) {
      checks.line_api_user_prefix = lineData.sub.substring(0, 8) + "...";
    }
  } catch (e) {
    checks.line_api_error = String(e);
  }

  return NextResponse.json(checks);
}
