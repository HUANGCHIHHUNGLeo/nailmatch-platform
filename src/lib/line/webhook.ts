import crypto from "crypto";
import type { WebhookEvent } from "@line/bot-sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { pushMessage, pushFlexMessage } from "./messaging";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "";
const LIFF_URL = LIFF_ID ? `https://liff.line.me/${LIFF_ID}` : APP_URL;

// Verify LINE webhook signature
export function verifySignature(
  body: string,
  signature: string
): boolean {
  const channelSecret = process.env.LINE_CHANNEL_SECRET || "";
  const hash = crypto
    .createHmac("SHA256", channelSecret)
    .update(body)
    .digest("base64");
  return hash === signature;
}

// Handle different webhook event types
export async function handleWebhookEvent(event: WebhookEvent) {
  switch (event.type) {
    case "follow":
      await handleFollow(event.source.userId!);
      break;
    case "unfollow":
      await handleUnfollow(event.source.userId!);
      break;
    case "message":
      if (event.message.type === "text") {
        await handleTextMessage(event.source.userId!, event.message.text);
      }
      break;
    case "postback":
      await handlePostback(event.source.userId!, event.postback.data);
      break;
  }
}

async function handleFollow(userId: string) {
  const supabase = await createServiceClient();

  // Check if user is already an artist
  const { data: artist } = await supabase
    .from("artists")
    .select("id, display_name")
    .eq("line_user_id", userId)
    .single();

  if (artist) {
    await supabase.from("artists").update({ is_active: true }).eq("id", artist.id);
    await pushMessage(userId, `歡迎回來，${artist.display_name}！\n\n有新的需求時會第一時間通知您。`);
    return;
  }

  // Check if user is an existing customer
  const { data: customer } = await supabase
    .from("customers")
    .select("id")
    .eq("line_user_id", userId)
    .single();

  if (!customer) {
    await supabase.from("customers").insert({ line_user_id: userId });
  }

  // Send welcome Flex Message
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
            uri: `${APP_URL}/request/new`,
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
}

async function handleUnfollow(userId: string) {
  const supabase = await createServiceClient();
  await supabase
    .from("artists")
    .update({ is_active: false })
    .eq("line_user_id", userId);
}

async function handleTextMessage(userId: string, text: string) {
  const lowerText = text.trim();

  if (["預約", "美甲", "我要預約", "找美甲師"].some((kw) => lowerText.includes(kw))) {
    await pushMessage(
      userId,
      `想找美甲師嗎？點擊下方連結填寫需求，3 分鐘就能收到報價：\n\n${APP_URL}/request`
    );
    return;
  }

  if (["我的預約", "查詢", "進度"].some((kw) => lowerText.includes(kw))) {
    const supabase = await createServiceClient();

    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("line_user_id", userId)
      .single();

    if (customer) {
      const { data: latestRequest } = await supabase
        .from("service_requests")
        .select("id, status")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (latestRequest) {
        const statusLabels: Record<string, string> = {
          pending: "等待中",
          matching: "配對中",
          matched: "已配對",
          confirmed: "已確認",
          completed: "已完成",
          cancelled: "已取消",
        };
        const label = statusLabels[latestRequest.status] || latestRequest.status;
        await pushMessage(
          userId,
          `您最新的需求狀態：${label}\n\n查看詳情：${APP_URL}/request/${latestRequest.id}`
        );
        return;
      }
    }

    await pushMessage(userId, `目前沒有進行中的需求。\n\n立即送出需求：${APP_URL}/request`);
    return;
  }

  await pushMessage(
    userId,
    `感謝您的訊息！\n\n想預約美甲？輸入「預約」或點擊下方選單開始。\n想查詢進度？輸入「我的預約」。`
  );
}

async function handlePostback(userId: string, data: string) {
  const params = new URLSearchParams(data);
  const action = params.get("action");

  switch (action) {
    case "view_request": {
      const requestId = params.get("requestId");
      if (requestId) {
        await pushMessage(userId, `查看需求詳情：\n${APP_URL}/artist/requests/${requestId}`);
      }
      break;
    }
    case "new_request": {
      await pushMessage(userId, `填寫需求表單：\n${APP_URL}/request`);
      break;
    }
    default: {
      await pushMessage(userId, "收到您的操作，請稍候處理。");
      break;
    }
  }
}
