import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { pushFlexMessage } from "@/lib/line/messaging";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({
      error: "需要 userId 參數",
      usage: "/api/test-line?userId=Uxxxxxx",
      hint: "在 LINE Developers Console → Messaging API tab 最下面找 Your user ID",
    });
  }

  try {
    // 1. Test DB connection
    const supabase = await createServiceClient();
    const { error: dbError } = await supabase
      .from("customers")
      .select("id")
      .limit(1);

    if (dbError) {
      return NextResponse.json({ step: "DB", error: dbError.message }, { status: 500 });
    }

    // 2. Send the same welcome Flex Message as the webhook
    await pushFlexMessage(userId, "歡迎使用 NaLi Match！", {
      type: "bubble",
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "text",
            text: "歡迎使用 NaLi Match",
            weight: "bold",
            size: "lg",
            color: "#E91E8C",
          },
          {
            type: "text",
            text: "送出你的需求，美甲師會主動找上門報價！",
            wrap: true,
            size: "sm",
            color: "#666666",
            margin: "md",
          },
        ],
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "button",
            action: {
              type: "uri",
              label: "我要找美甲師",
              uri: `${APP_URL}/request`,
            },
            style: "primary",
            color: "#E91E8C",
          },
          {
            type: "button",
            action: {
              type: "uri",
              label: "我是美甲師",
              uri: `${APP_URL}/line/liff/artist-form`,
            },
            style: "link",
          },
        ],
      },
    });

    return NextResponse.json({ success: true, message: "Flex Message 已發送！去 LINE 檢查" });
  } catch (e) {
    return NextResponse.json({
      step: "LINE_PUSH",
      error: e instanceof Error ? e.message : String(e),
    }, { status: 500 });
  }
}
