import { NextResponse } from "next/server";
import { verifySignature, handleWebhookEvent } from "@/lib/line/webhook";
import type { WebhookEvent } from "@line/bot-sdk";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-line-signature");

    if (!signature || !verifySignature(body, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const payload = JSON.parse(body) as { events: WebhookEvent[] };

    // Process events asynchronously
    await Promise.all(
      payload.events.map((event) => handleWebhookEvent(event))
    );

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
