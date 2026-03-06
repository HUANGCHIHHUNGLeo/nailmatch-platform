import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setupRichMenus } from "@/lib/line/richmenu";

export async function POST() {
  // Admin auth check
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  if (session?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await setupRichMenus();
    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Rich Menu setup failed:", error);
    return NextResponse.json(
      { error: "Setup failed", details: String(error) },
      { status: 500 }
    );
  }
}
