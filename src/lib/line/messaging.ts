import { messagingApi } from "@line/bot-sdk";

const client = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || "",
});

// Send push message to a single user
export async function pushMessage(userId: string, text: string) {
  return client.pushMessage({
    to: userId,
    messages: [{ type: "text", text }],
  });
}

// Send Flex Message (rich card) to a single user
export async function pushFlexMessage(
  userId: string,
  altText: string,
  contents: messagingApi.FlexBubble
) {
  return client.pushMessage({
    to: userId,
    messages: [
      {
        type: "flex",
        altText,
        contents,
      },
    ],
  });
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
    header: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "新需求通知",
          weight: "bold",
          size: "lg",
          color: "#E91E8C",
        },
      ],
    },
    body: {
      type: "box",
      layout: "vertical",
      spacing: "md",
      contents: [
        {
          type: "text",
          text: `服務項目：${requestSummary.services.join("、")}`,
          wrap: true,
          size: "sm",
        },
        {
          type: "text",
          text: `地點：${requestSummary.location}`,
          size: "sm",
        },
        {
          type: "text",
          text: `預算：${requestSummary.budget}`,
          size: "sm",
        },
        {
          type: "text",
          text: `時間：${requestSummary.date}`,
          size: "sm",
        },
      ],
    },
    footer: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "button",
          action: {
            type: "uri",
            label: "查看需求詳情",
            uri: `${process.env.NEXT_PUBLIC_APP_URL}/artist/requests/${requestSummary.requestId}`,
          },
          style: "primary",
          color: "#E91E8C",
        },
      ],
    },
  };

  // Send to each artist (multicast has 500 limit)
  if (artistLineIds.length <= 500) {
    return client.multicast({
      to: artistLineIds,
      messages: [
        {
          type: "flex",
          altText: `新的美甲需求：${requestSummary.services.join("、")}`,
          contents: bubble,
        },
      ],
    });
  }

  // Batch send for more than 500
  const batches = [];
  for (let i = 0; i < artistLineIds.length; i += 500) {
    batches.push(artistLineIds.slice(i, i + 500));
  }
  return Promise.all(
    batches.map((batch) =>
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
  );
}

// Notify customer of new quote
export async function notifyCustomerOfQuote(
  customerLineId: string,
  quote: {
    artistName: string;
    price: number;
    requestId: string;
  }
) {
  return pushMessage(
    customerLineId,
    `${quote.artistName} 已對您的需求報價 NT$${quote.price.toLocaleString()}\n\n查看報價詳情：${process.env.NEXT_PUBLIC_APP_URL}/responses/${quote.requestId}`
  );
}

// Notify booking confirmation
export async function notifyBookingConfirmed(
  userLineId: string,
  booking: {
    date: string;
    time: string;
    artistName: string;
    location: string;
  }
) {
  return pushMessage(
    userLineId,
    `預約確認！\n\n日期：${booking.date}\n時間：${booking.time}\n美甲師：${booking.artistName}\n地點：${booking.location}\n\n期待為您服務！`
  );
}
