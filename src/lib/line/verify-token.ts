/**
 * Verify a LINE LIFF ID token using LINE's official verify API.
 * Returns the user ID if valid, null otherwise.
 */
export async function verifyLineIdToken(idToken: string): Promise<{ userId: string } | null> {
  try {
    const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
    if (!channelId) {
      console.error("[verifyLineIdToken] LINE_LOGIN_CHANNEL_ID not set");
      return null;
    }

    // Use LINE's official verify endpoint
    const res = await fetch("https://api.line.me/oauth2/v2.1/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id_token: idToken, client_id: channelId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[verifyLineIdToken] LINE API rejected token:", err.error_description || err.error || res.status);
      return null;
    }

    const data = await res.json();
    if (!data.sub) {
      console.error("[verifyLineIdToken] No sub in LINE API response");
      return null;
    }

    return { userId: data.sub };
  } catch (err) {
    console.error("[verifyLineIdToken] Exception:", err);
    return null;
  }
}

/**
 * Extract and verify LINE user ID from a request's Authorization header.
 * Returns the LINE user ID or null if auth fails.
 */
export async function getLineUserId(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.slice(7);
  const result = await verifyLineIdToken(token);
  return result?.userId || null;
}
