import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { artistQuoteSchema } from "@/lib/utils/form-schema";
import { notifyCustomerOfQuote } from "@/lib/line/messaging";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestId, artistId, ...quoteData } = body;

    // Validate quote data
    const parsed = artistQuoteSchema.safeParse(quoteData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid quote data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Resolve artist ID: use provided, or look up from auth, or fallback for local dev
    let finalArtistId = artistId;
    if (!finalArtistId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      let artistQuery = supabase.from("artists").select("id");
      if (user) {
        artistQuery = artistQuery.eq("line_user_id", user.id);
      } else {
        artistQuery = artistQuery.eq("is_active", true).limit(1);
      }
      const { data: artist } = await artistQuery.single();
      finalArtistId = artist?.id;
    }

    if (!finalArtistId) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

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
