import { NextResponse } from "next/server";
import crypto from "crypto";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export async function POST(request: Request) {
  // 管理員登入：每分鐘最多 5 次（防暴力破解）
  const ip = getClientIp(request);
  const rl = checkRateLimit(`admin-login:${ip}`, { windowMs: 60_000, max: 5 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "嘗試過於頻繁，請稍後再試" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }
  try {
    const { password } = await request.json();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "Admin password not configured" },
        { status: 500 }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        { error: "密碼錯誤" },
        { status: 401 }
      );
    }

    // Create a session token (use . separator to avoid URL encoding issues with :)
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const sessionData = `${token}.${expiry}`;
    const hmac = crypto
      .createHmac("sha256", adminPassword)
      .update(sessionData)
      .digest("hex");

    const sessionValue = `${sessionData}.${hmac}`;

    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_session", sessionValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60, // 24 hours
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
