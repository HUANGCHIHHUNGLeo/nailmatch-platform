import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { setupRichMenus } from "@/lib/line/richmenu";

export async function POST() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await setupRichMenus();
    await logAdminAction({ action: "richmenu.setup", entityType: "richmenu", details: result });
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
