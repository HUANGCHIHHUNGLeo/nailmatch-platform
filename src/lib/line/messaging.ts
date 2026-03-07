import { messagingApi } from "@line/bot-sdk";
import { withRetry } from "./retry";

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

const LIFF_ID = process.env.NEXT_PUBLIC_LIFF_ID || "";

// Send push message to a single user (with retry on transient failures)
export async function pushMessage(userId: string, text: string) {
  return withRetry(() =>
    client.pushMessage({
      to: userId,
      messages: [{ type: "text", text }],
    })
  );
}

// Send Flex Message (rich card) to a single user (with retry on transient failures)
export async function pushFlexMessage(
  userId: string,
  altText: string,
  contents: messagingApi.FlexBubble
) {
  return withRetry(() =>
    client.pushMessage({
      to: userId,
      messages: [
        {
          type: "flex",
          altText,
          contents,
        },
      ],
    })
  );
}

// Broadcast new request notification to multiple artists
export async function notifyArtistsOfNewRequest(
  artistLineIds: string[],
  requestSummary: {
    services: string[];
    location: string;
    budget: string;
    date: string;
    requestId: string;
  }
) {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "NEW",
              size: "xs",
              color: "#FFFFFF",
              weight: "bold",
            },
          ],
          backgroundColor: "#D4A0A0",
          cornerRadius: "xl",
          paddingAll: "6px",
          paddingStart: "12px",
          paddingEnd: "12px",
          width: "52px",
        },
        {
          type: "text",
          text: "新需求通知",
          weight: "bold",
          size: "xl",
          color: "#1a1a1a",
          margin: "md",
        },
        { type: "separator", margin: "lg", color: "#f0f0f0" },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          margin: "lg",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "服務項目", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: requestSummary.services.join("、"), size: "sm", color: "#333333", flex: 5, wrap: true },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "地點", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: requestSummary.location, size: "sm", color: "#333333", flex: 5, wrap: true },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "預算", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: requestSummary.budget, size: "sm", color: "#333333", flex: 5 },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "時間", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: requestSummary.date, size: "sm", color: "#333333", flex: 5 },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "查看需求詳情",
            uri: `https://liff.line.me/${LIFF_ID}/artist/requests/${requestSummary.requestId}`,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
      ],
    },
    styles: {
      footer: { backgroundColor: "#FAFAF8" },
    },
  };

  // Send to each artist (multicast has 500 limit) — with retry
  if (artistLineIds.length <= 500) {
    return withRetry(() =>
      client.multicast({
        to: artistLineIds,
        messages: [
          {
            type: "flex",
            altText: `新的美甲需求：${requestSummary.services.join("、")}`,
            contents: bubble,
          },
        ],
      })
    );
  }

  // Batch send for more than 500
  const batches = [];
  for (let i = 0; i < artistLineIds.length; i += 500) {
    batches.push(artistLineIds.slice(i, i + 500));
  }
  return Promise.allSettled(
    batches.map((batch) =>
      withRetry(() =>
        client.multicast({
          to: batch,
          messages: [
            {
              type: "flex",
              altText: `新的美甲需求：${requestSummary.services.join("、")}`,
              contents: bubble,
            },
          ],
        })
      )
    )
  );
}

// Notify customer of new quote (Flex Message)
export async function notifyCustomerOfQuote(
  customerLineId: string,
  quote: {
    artistName: string;
    price: number;
    requestId: string;
  }
) {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "NEW",
              size: "xs",
              color: "#FFFFFF",
              weight: "bold",
            },
          ],
          backgroundColor: "#D4A0A0",
          cornerRadius: "xl",
          paddingAll: "6px",
          paddingStart: "12px",
          paddingEnd: "12px",
          width: "52px",
        },
        {
          type: "text",
          text: "收到新報價！",
          weight: "bold",
          size: "xl",
          color: "#1a1a1a",
          margin: "md",
        },
        { type: "separator", margin: "lg", color: "#f0f0f0" },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          margin: "lg",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "設計師", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: quote.artistName, size: "sm", color: "#333333", flex: 5, weight: "bold" },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "報價金額", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: `NT$${quote.price.toLocaleString()}`, size: "md", color: "#D4A0A0", flex: 5, weight: "bold" },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "查看報價詳情",
            uri: `https://liff.line.me/${LIFF_ID}/request/${quote.requestId}`,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
      ],
    },
    styles: {
      footer: { backgroundColor: "#FAFAF8" },
    },
  };

  return pushFlexMessage(customerLineId, `${quote.artistName} 報價 NT$${quote.price.toLocaleString()}`, bubble);
}

// Notify booking confirmation (Flex Message)
export async function notifyBookingConfirmed(
  userLineId: string,
  booking: {
    date: string;
    time: string;
    artistName: string;
    location: string;
    bookingId?: string;
  }
) {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "text",
          text: "預約確認",
          weight: "bold",
          size: "xl",
          color: "#1a1a1a",
        },
        { type: "separator", margin: "lg", color: "#f0f0f0" },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          margin: "lg",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "日期", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: booking.date, size: "sm", color: "#333333", flex: 5 },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "時間", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: booking.time, size: "sm", color: "#333333", flex: 5 },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "設計師", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: booking.artistName, size: "sm", color: "#333333", flex: 5, weight: "bold" },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "地點", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: booking.location, size: "sm", color: "#333333", flex: 5, wrap: true },
              ],
            },
          ],
        },
      ],
    },
    footer: booking.bookingId
      ? {
          type: "box",
          layout: "vertical",
          paddingAll: "20px",
          contents: [
            {
              type: "button",
              action: {
                type: "uri",
                label: "查看預約詳情",
                uri: `https://liff.line.me/${LIFF_ID}/booking/${booking.bookingId}`,
              },
              style: "primary",
              color: "#D4A0A0",
              height: "md",
            },
          ],
        }
      : undefined,
    styles: {
      body: { backgroundColor: "#FAFAF8" },
      ...(booking.bookingId ? { footer: { backgroundColor: "#FAFAF8" } } : {}),
    },
  };

  return pushFlexMessage(userLineId, `預約確認 - ${booking.artistName}`, bubble);
}

// Notify that a booking has been cancelled
export async function notifyBookingCancelled(
  userLineId: string,
  info: {
    cancelledBy: string; // "客戶" or "設計師"
    artistName: string;
    services: string[];
    bookingDate: string;
    bookingId: string;
  }
) {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "預約已取消",
              weight: "bold",
              size: "xl",
              color: "#dc2626",
            },
          ],
        },
        { type: "separator", margin: "lg", color: "#f0f0f0" },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          margin: "lg",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "取消方", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.cancelledBy, size: "sm", color: "#dc2626", flex: 5, weight: "bold" },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "設計師", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.artistName, size: "sm", color: "#333333", flex: 5 },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "服務", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.services.join("、"), size: "sm", color: "#333333", flex: 5, wrap: true },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "日期", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.bookingDate, size: "sm", color: "#333333", flex: 5 },
              ],
            },
          ],
        },
        {
          type: "text",
          text: "需求已重新開放配對，您可以繼續接受其他報價。",
          size: "xs",
          color: "#999999",
          margin: "lg",
          wrap: true,
        },
      ],
    },
    styles: { body: { backgroundColor: "#FAFAF8" } },
  };

  return pushFlexMessage(userLineId, `預約已取消 - ${info.artistName}`, bubble);
}

// Notify that a booking reschedule has been requested
export async function notifyBookingReschedule(
  userLineId: string,
  info: {
    requestedBy: string;
    artistName: string;
    oldDate: string;
    newDate: string;
    newTime: string;
    bookingId: string;
  }
) {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "text",
          text: "改期請求",
          weight: "bold",
          size: "xl",
          color: "#d97706",
        },
        { type: "separator", margin: "lg", color: "#f0f0f0" },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          margin: "lg",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "申請方", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.requestedBy, size: "sm", color: "#d97706", flex: 5, weight: "bold" },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "設計師", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.artistName, size: "sm", color: "#333333", flex: 5 },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "原日期", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.oldDate, size: "sm", color: "#999999", flex: 5, decoration: "line-through" },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "新日期", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: `${info.newDate} ${info.newTime}`, size: "sm", color: "#059669", flex: 5, weight: "bold" },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "查看預約詳情",
            uri: `https://liff.line.me/${LIFF_ID}/booking/${info.bookingId}`,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
      ],
    },
    styles: {
      body: { backgroundColor: "#FAFAF8" },
      footer: { backgroundColor: "#FAFAF8" },
    },
  };

  return pushFlexMessage(userLineId, `改期請求 - ${info.artistName}`, bubble);
}

// Notify customer to leave a review after booking completion
export async function notifyReviewPrompt(
  customerLineId: string,
  info: {
    artistName: string;
    bookingId: string;
  }
) {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "text",
          text: "服務已完成",
          weight: "bold",
          size: "xl",
          color: "#1a1a1a",
        },
        {
          type: "text",
          text: `感謝您使用 NaLi Match！希望 ${info.artistName} 的服務讓您滿意。`,
          size: "sm",
          color: "#666666",
          wrap: true,
          margin: "md",
        },
        {
          type: "text",
          text: "留下您的評價，幫助其他人找到好設計師！",
          size: "sm",
          color: "#999999",
          wrap: true,
          margin: "sm",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "留下評價",
            uri: `https://liff.line.me/${LIFF_ID}/booking/${info.bookingId}`,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
      ],
    },
    styles: {
      footer: { backgroundColor: "#FAFAF8" },
    },
  };

  return pushFlexMessage(customerLineId, `請為 ${info.artistName} 留下評價`, bubble);
}

// Notify returning artist (welcome back) — Flex Message
export async function notifyArtistWelcomeBack(
  userId: string,
  displayName: string
) {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "text",
          text: `歡迎回來，${displayName}！`,
          weight: "bold",
          size: "xl",
          color: "#1a1a1a",
        },
        {
          type: "text",
          text: "有新的需求時會第一時間通知您。",
          size: "sm",
          color: "#666666",
          wrap: true,
          margin: "md",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "查看新需求",
            uri: `https://liff.line.me/${LIFF_ID}/artist`,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
      ],
    },
    styles: {
      footer: { backgroundColor: "#FAFAF8" },
    },
  };
  return pushFlexMessage(userId, `歡迎回來，${displayName}！`, bubble);
}

// Notify artist of approval — Flex Message
export async function notifyArtistApproved(
  userId: string,
  displayName: string
) {
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "✓ 通過",
              size: "xs",
              color: "#FFFFFF",
              weight: "bold",
            },
          ],
          backgroundColor: "#22C55E",
          cornerRadius: "xl",
          paddingAll: "6px",
          paddingStart: "12px",
          paddingEnd: "12px",
          width: "64px",
        },
        {
          type: "text",
          text: "審核通過！",
          weight: "bold",
          size: "xl",
          color: "#1a1a1a",
          margin: "md",
        },
        {
          type: "text",
          text: `恭喜 ${displayName}！您的設計師資格已通過審核，現在可以開始接案了。`,
          size: "sm",
          color: "#666666",
          wrap: true,
          margin: "md",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "前往設計師後台",
            uri: `https://liff.line.me/${LIFF_ID}/artist`,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
      ],
    },
    styles: {
      footer: { backgroundColor: "#FAFAF8" },
    },
  };
  return pushFlexMessage(userId, "恭喜！您的設計師審核已通過", bubble);
}

// Notify artist of rejection — Flex Message
export async function notifyArtistRejected(
  userId: string,
  reason?: string
) {
  const liffId = LIFF_ID;
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "未通過",
              size: "xs",
              color: "#FFFFFF",
              weight: "bold",
            },
          ],
          backgroundColor: "#EF4444",
          cornerRadius: "xl",
          paddingAll: "6px",
          paddingStart: "12px",
          paddingEnd: "12px",
          width: "60px",
        },
        {
          type: "text",
          text: "審核未通過",
          weight: "bold",
          size: "xl",
          color: "#1a1a1a",
          margin: "md",
        },
        {
          type: "text",
          text: reason || "很抱歉，您的申請目前未通過審核。請確認資料完整後重新申請。",
          size: "sm",
          color: "#666666",
          wrap: true,
          margin: "md",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "重新申請",
            uri: `https://liff.line.me/${liffId}/artist-form`,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
      ],
    },
    styles: {
      footer: { backgroundColor: "#FAFAF8" },
    },
  };
  return pushFlexMessage(userId, "設計師審核結果通知", bubble);
}

// Generic helper menu with buttons — Flex Message
export async function notifyHelperMenu(userId: string) {
  const liffId = LIFF_ID;
  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "text",
          text: "NaLi Match",
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
        { type: "separator", margin: "lg", color: "#f0f0f0" },
        {
          type: "text",
          text: "請選擇您需要的服務：",
          size: "sm",
          color: "#666666",
          margin: "lg",
        },
        {
          type: "text",
          text: "💡 也可以輸入關鍵字：\n「預約」填寫需求｜「查詢」查看進度\n「登入」設計師後台｜「註冊」成為設計師",
          size: "xs",
          color: "#aaaaaa",
          margin: "md",
          wrap: true,
          lineSpacing: "4px",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "我要預約",
            uri: `https://liff.line.me/${liffId}/customer-form`,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
        {
          type: "button",
          action: {
            type: "uri",
            label: "查詢我的紀錄",
            uri: `https://liff.line.me/${liffId}/my`,
          },
          style: "secondary",
          color: "#F5F0EB",
          height: "md",
        },
        {
          type: "button",
          action: {
            type: "uri",
            label: "設計師入口（登入/註冊）",
            uri: `https://liff.line.me/${liffId}/artist`,
          },
          style: "secondary",
          color: "#F5F0EB",
          height: "md",
        },
      ],
    },
    styles: {
      footer: { backgroundColor: "#FAFAF8" },
    },
  };
  return pushFlexMessage(userId, "NaLi Match — 請選擇服務", bubble);
}

// Notify customer that their request has expired
export async function notifyRequestExpired(
  customerLineId: string,
  info: {
    services: string[];
    preferredDate: string;
    requestId: string;
  }
) {
  const newRequestUrl = `https://liff.line.me/${LIFF_ID}/customer-form`;

  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: "已過期",
              size: "xs",
              color: "#FFFFFF",
              weight: "bold",
            },
          ],
          backgroundColor: "#999999",
          cornerRadius: "xl",
          paddingAll: "6px",
          paddingStart: "12px",
          paddingEnd: "12px",
          width: "60px",
        },
        {
          type: "text",
          text: "您的需求已過期",
          weight: "bold",
          size: "xl",
          color: "#1a1a1a",
          margin: "md",
        },
        {
          type: "text",
          text: `您的「${info.services.slice(0, 2).join("、")}」需求（預約日期：${info.preferredDate}）已超過預約時間，系統已自動關閉。`,
          size: "sm",
          color: "#666666",
          wrap: true,
          margin: "md",
        },
        {
          type: "text",
          text: "如果仍有需求，歡迎重新預約！",
          size: "sm",
          color: "#999999",
          wrap: true,
          margin: "sm",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      spacing: "sm",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "重新預約",
            uri: newRequestUrl,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
        {
          type: "button",
          action: {
            type: "uri",
            label: "查看原需求",
            uri: `https://liff.line.me/${LIFF_ID}/request/${info.requestId}`,
          },
          style: "link",
          color: "#999999",
          height: "sm",
        },
      ],
    },
    styles: {
      footer: { backgroundColor: "#FAFAF8" },
    },
  };

  return pushFlexMessage(customerLineId, "您的需求已過期，歡迎重新預約", bubble);
}

// Notify both parties about an upcoming booking
export async function notifyBookingReminder(
  userLineId: string,
  info: {
    artistName: string;
    bookingDate: string;
    bookingTime: string;
    location: string;
    bookingId: string;
    isToday: boolean;
  }
) {
  const timeLabel = info.isToday ? "今天" : "明天";

  const bubble: messagingApi.FlexBubble = {
    type: "bubble",
    size: "mega",
    body: {
      type: "box",
      layout: "vertical",
      spacing: "lg",
      paddingAll: "24px",
      contents: [
        {
          type: "box",
          layout: "horizontal",
          contents: [
            {
              type: "text",
              text: timeLabel,
              size: "xs",
              color: "#FFFFFF",
              weight: "bold",
            },
          ],
          backgroundColor: "#f59e0b",
          cornerRadius: "xl",
          paddingAll: "6px",
          paddingStart: "12px",
          paddingEnd: "12px",
          width: "52px",
        },
        {
          type: "text",
          text: `${timeLabel}有預約提醒`,
          weight: "bold",
          size: "xl",
          color: "#1a1a1a",
          margin: "md",
        },
        { type: "separator", margin: "lg", color: "#f0f0f0" },
        {
          type: "box",
          layout: "vertical",
          spacing: "sm",
          margin: "lg",
          contents: [
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "設計師", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.artistName, size: "sm", color: "#333333", flex: 5, weight: "bold" },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "日期", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.bookingDate, size: "sm", color: "#333333", flex: 5 },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "時間", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.bookingTime || "待確認", size: "sm", color: "#333333", flex: 5 },
              ],
            },
            {
              type: "box",
              layout: "horizontal",
              contents: [
                { type: "text", text: "地點", size: "sm", color: "#999999", flex: 3 },
                { type: "text", text: info.location || "待確認", size: "sm", color: "#333333", flex: 5, wrap: true },
              ],
            },
          ],
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      paddingAll: "20px",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "查看預約詳情",
            uri: `https://liff.line.me/${LIFF_ID}/booking/${info.bookingId}`,
          },
          style: "primary",
          color: "#D4A0A0",
          height: "md",
        },
      ],
    },
    styles: {
      footer: { backgroundColor: "#FAFAF8" },
    },
  };

  return pushFlexMessage(userLineId, `${timeLabel}有預約 - ${info.artistName}`, bubble);
}
