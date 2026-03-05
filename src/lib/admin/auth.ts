import crypto from "crypto";
import { cookies } from "next/headers";

export async function verifyAdminSession(): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;
  if (!session) return false;

  const parts = session.split(":");
  if (parts.length !== 3) return false;

  const [token, expiryStr, hmac] = parts;
  const expiry = parseInt(expiryStr, 10);

  // Check expiry
  if (Date.now() > expiry) return false;

  // Verify HMAC
  const sessionData = `${token}:${expiryStr}`;
  const expectedHmac = crypto
    .createHmac("sha256", adminPassword)
    .update(sessionData)
    .digest("hex");

  return hmac === expectedHmac;
}
