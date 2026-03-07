import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { artistQuoteSchema } from "@/lib/utils/form-schema";
import { notifyCustomerOfQuote } from "@/lib/line/messaging";
import { resolveArtist } from "@/lib/auth/resolve-artist";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export async function POST(request: Request) {
  // 報價：每分鐘最多 10 次
  const ip = getClientIp(request);
  const rl = checkRateLimit(`response-post:${ip}`, { windowMs: 60_000, max: 10 });
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "請求過於頻繁，請稍後再試" },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { requestId, ...quoteData } = body;

    // Validate quote data
    const parsed = artistQuoteSchema.safeParse(quoteData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quote data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Resolve artist ID from auth token only
    const resolved = await resolveArtist(request);
    if (!resolved) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    const finalArtistId = resolved.artistId;

    const supabase = await createServiceClient();

    // Create artist response
    const { data: response, error } = await supabase
      .from("artist_responses")
      .insert({
        request_id: requestId,
        artist_id: finalArtistId,
        quoted_price: parsed.data.quotedPrice,
        message: parsed.data.message,
        available_time: parsed.data.availableTime,
        status: "pending",
      })
      .select("id")
      .single();

    if (error || !response) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Failed to submit quote" },
        { status: 500 }
      );
    }

    // Notify customer via LINE (non-blocking)
    const { data: serviceRequest } = await supabase
      .from("service_requests")
      .select("customer_id")
      .eq("id", requestId)
      .single();

    const { data: artist } = await supabase
      .from("artists")
      .select("display_name")
      .eq("id", finalArtistId)
      .single();

    if (serviceRequest && artist) {
      const { data: customer } = await supabase
        .from("customers")
        .select("line_user_id")
        .eq("id", serviceRequest.customer_id)
        .single();

      if (customer?.line_user_id) {
        notifyCustomerOfQuote(customer.line_user_id, {
          artistName: artist.display_name,
          price: parsed.data.quotedPrice,
          requestId,
        }).catch((err) => {
          console.error("Failed to notify customer:", err);
        });
      }
    }

    return NextResponse.json({ id: response.id });
  } catch (error) {
    console.error("Response API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
