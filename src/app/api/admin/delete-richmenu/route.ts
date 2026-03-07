import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { logAdminAction } from "@/lib/admin/audit";
import { messagingApi } from "@line/bot-sdk";

export async function POST() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = new messagingApi.MessagingApiClient({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
    });

    const existingResult = await client.getRichMenuList();
    const existing = Array.isArray(existingResult)
      ? existingResult
      : (existingResult as { richmenus?: unknown[] }).richmenus || [];

    let deleted = 0;
    for (const menu of existing as { richMenuId: string }[]) {
      await client.deleteRichMenu(menu.richMenuId);
      deleted++;
    }

    await logAdminAction({ action: "richmenu.delete", entityType: "richmenu", details: { deleted } });
    return NextResponse.json({
      success: true,
      deleted,
      message: deleted > 0
        ? `已刪除 ${deleted} 個 Messaging API Rich Menu，LINE 官方後台的設定將會生效`
        : "沒有找到 Messaging API 建立的 Rich Menu",
    });
  } catch (error) {
    console.error("Rich Menu delete failed:", error);
    return NextResponse.json(
      { error: "刪除失敗", details: String(error) },
      { status: 500 }
    );
  }
}
