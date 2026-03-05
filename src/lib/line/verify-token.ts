import crypto from "crypto";

/**
 * Verify a LINE LIFF ID token and extract the user ID.
 * The token is a JWT signed with HS256 using the LINE Login channel secret.
 */
export function verifyLineIdToken(idToken: string): { userId: string } | null {
  try {
    const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
    const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;
    if (!channelId || !channelSecret) return null;

    const parts = idToken.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Verify HMAC-SHA256 signature
    const data = `${headerB64}.${payloadB64}`;
    const expectedSig = crypto
      .createHmac("sha256", channelSecret)
      .update(data)
      .digest("base64url");

    if (signatureB64 !== expectedSig) return null;

    // Decode payload
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString()
    );

    // Verify issuer and audience
    if (payload.iss !== "https://access.line.me") return null;
    if (payload.aud !== channelId) return null;

    // Verify expiry
    if (payload.exp && payload.exp < Date.now() / 1000) return null;

    return { userId: payload.sub };
  } catch {
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
