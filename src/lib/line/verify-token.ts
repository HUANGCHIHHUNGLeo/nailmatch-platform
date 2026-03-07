import crypto from "crypto";

/**
 * Verify a LINE LIFF ID token and extract the user ID.
 * The token is a JWT signed with HS256 using the LINE Login channel secret.
 */
export function verifyLineIdToken(idToken: string): { userId: string } | null {
  try {
    const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
    const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;
    if (!channelId || !channelSecret) {
      console.error("[verifyLineIdToken] LINE_LOGIN_CHANNEL_ID or LINE_LOGIN_CHANNEL_SECRET not set");
      return null;
    }

    const parts = idToken.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify HMAC-SHA256 signature
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = crypto
      .createHmac("sha256", channelSecret)
      .update(data)
      .digest("base64url");

    if (signatureB64 !== expectedSig) {
      console.error("[verifyLineIdToken] Signature mismatch — check LINE_LOGIN_CHANNEL_SECRET");
      return null;
    }

    // Decode payload
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString()
    );

    // Verify issuer and audience
    if (payload.iss !== "https://access.line.me") return null;
    if (payload.aud !== channelId) {
      console.error(`[verifyLineIdToken] Audience mismatch: token aud=${payload.aud}, expected=${channelId}`);
      return null;
    }

    // Verify expiry
    if (payload.exp && payload.exp < Date.now() / 1000) {
      console.error(`[verifyLineIdToken] Token expired: exp=${new Date(payload.exp * 1000).toISOString()}`);
      return null;
    }

    return { userId: payload.sub };
  } catch (err) {
    console.error("[verifyLineIdToken] Exception:", err);
    return null;
  }
}

/**
 * Extract and verify LINE user ID from a request's Authorization header.
 * Returns the LINE user ID or null if auth fails.
 */
export function getLineUserId(request: Request): string | null {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const result = verifyLineIdToken(token);
  return result?.userId || null;
}
