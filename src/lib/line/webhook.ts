import crypto from "crypto";
import type { WebhookEvent } from "@line/bot-sdk";
import { createServiceClient } from "@/lib/supabase/server";
import { pushMessage, pushFlexMessage, notifyArtistWelcomeBack, notifyHelperMenu, notifyArtistsOfNewRequest } from "./messaging";
import { linkArtistRichMenu } from "./richmenu";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://nailmatch-platform.vercel.app";
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
    await notifyArtistWelcomeBack(userId, artist.display_name);
    // Switch to artist Rich Menu
    await linkArtistRichMenu(userId).catch(() => {});

    // Send pending matching requests the artist may have missed
    try {
      const { data: artistData } = await supabase
        .from("artists")
        .select("cities")
        .eq("id", artist.id)
        .single();

      if (artistData?.cities?.length) {
        const { data: pendingRequests } = await supabase
          .from("service_requests")
          .select("id, services, locations, budget_range, preferred_date")
          .eq("status", "matching")
          .overlaps("locations", artistData.cities)
          .order("created_at", { ascending: false })
          .limit(3);

        if (pendingRequests?.length) {
          for (const req of pendingRequests) {
            await notifyArtistsOfNewRequest([userId], {
              services: req.services || [],
              location: (req.locations || []).join("、"),
              budget: req.budget_range || "",
              date: req.preferred_date || "",
              requestId: req.id,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to send pending requests to returning artist:", err);
    }

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

  // Send welcome Flex Message — elegant card style
  await pushFlexMessage(userId, "歡迎使用 NaLi Match！", {
    type: "bubble",
    size: "mega",
    hero: {
      type: "image",
      url: `${APP_URL}/logo.png`,
      size: "full",
      aspectRatio: "20:13",
      aspectMode: "cover",
      action: { type: "uri", label: "官網", uri: APP_URL },
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "text",
          text: "NaLi MATCH",
          weight: "bold",
          size: "xl",
          color: "#1a1a1a",
        },
        {
          type: "text",
          text: "美甲・美睫媒合平台",
          size: "sm",
          color: "#999999",
          margin: "sm",
        },
        {
          type: "separator",
          margin: "lg",
          color: "#f0f0f0",
        },
        {
          type: "text",
          text: "只需 3 分鐘填寫需求，\n讓合適的美甲/美睫師主動為您報價！",
          wrap: true,
          size: "sm",
          color: "#555555",
          margin: "lg",
          lineSpacing: "8px",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "我要預約 Book Now",
            uri: `https://liff.line.me/${LIFF_ID}/customer-form`,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
        {
          type: "button",
          action: {
            type: "uri",
            label: "我是設計師・註冊加入",
            uri: `https://liff.line.me/${LIFF_ID}/artist-form`,
          },
          style: "secondary",
          color: "#F5F0EB",
          height: "md",
        },
      ],
    },
    styles: {
      hero: { backgroundColor: "#F5E6E0" },
      footer: { backgroundColor: "#FAFAF8" },
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

  // Hidden admin command — only responds to designated admins
  if (lowerText === "後台設置") {
    const adminIds = (process.env.ADMIN_LINE_USER_ID || "")
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
    if (adminIds.includes(userId)) {
      await pushMessage(
        userId,
        `管理後台入口：\n${APP_URL}/admin/login`
      );
    } else {
      await pushMessage(userId, "感謝您的訊息！如需預約美甲，請輸入「預約」。");
    }
    return;
  }

  if (["登入", "後台", "設計師登入", "我是設計師"].some((kw) => lowerText.includes(kw))) {
    await pushMessage(
      userId,
      `設計師後台入口：\n\nhttps://liff.line.me/${LIFF_ID}/artist`
    );
    return;
  }

  if (["預約", "美甲", "美睫", "我要預約", "找美甲師", "找設計師"].some((kw) => lowerText.includes(kw))) {
    await pushMessage(
      userId,
      `想找設計師嗎？點擊下方連結填寫需求，3 分鐘就能收到報價：\n\nhttps://liff.line.me/${LIFF_ID}/customer-form`
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
          `您最新的需求狀態：${label}\n\n查看詳情：${APP_URL}/request/${latestRequest.id}\n\n查看所有紀錄：https://liff.line.me/${LIFF_ID}/my`
        );
        return;
      }
    }

    await pushMessage(userId, `目前沒有進行中的需求。\n\n立即送出需求：https://liff.line.me/${LIFF_ID}/customer-form\n\n查看歷史紀錄：https://liff.line.me/${LIFF_ID}/my`);
    return;
  }

  await notifyHelperMenu(userId);
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
