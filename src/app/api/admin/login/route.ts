import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
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

    // Create a session token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const sessionData = `${token}:${expiry}`;
    const hmac = crypto
      .createHmac("sha256", adminPassword)
      .update(sessionData)
      .digest("hex");

    const sessionValue = `${sessionData}:${hmac}`;

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
