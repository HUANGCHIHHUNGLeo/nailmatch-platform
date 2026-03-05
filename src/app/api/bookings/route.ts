import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { notifyBookingConfirmed } from "@/lib/line/messaging";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requestId, responseId, customerId, artistId, bookingDate, bookingTime, finalPrice } = body;

    if (!requestId || !responseId || !customerId || !artistId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .insert({
        request_id: requestId,
        response_id: responseId,
        customer_id: customerId,
        artist_id: artistId,
        booking_date: bookingDate || null,
        booking_time: bookingTime || null,
        final_price: finalPrice,
        status: "confirmed",
      })
      .select("id")
      .single();

    if (bookingError || !booking) {
      console.error("Booking creation error:", bookingError);
      return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
    }

    // Update response status to accepted
    await supabase
      .from("artist_responses")
      .update({ status: "accepted" })
      .eq("id", responseId);

    // Update request status to confirmed
    await supabase
      .from("service_requests")
      .update({ status: "confirmed" })
      .eq("id", requestId);

    // Send LINE notifications to both parties
    const { data: artist } = await supabase
      .from("artists")
      .select("line_user_id, display_name, studio_address")
      .eq("id", artistId)
      .single();

    const { data: customer } = await supabase
      .from("customers")
      .select("line_user_id")
      .eq("id", customerId)
      .single();

    const bookingInfo = {
      date: bookingDate || "待確認",
      time: bookingTime || "待確認",
      artistName: artist?.display_name || "美甲師",
      location: artist?.studio_address || "待確認",
    };

    // Notify customer
    if (customer?.line_user_id) {
      await notifyBookingConfirmed(customer.line_user_id, bookingInfo).catch((err) => {
        console.error("Failed to notify customer:", err);
      });
    }

    // Notify artist
    if (artist?.line_user_id) {
      await notifyBookingConfirmed(artist.line_user_id, {
        ...bookingInfo,
        artistName: "您",
      }).catch((err) => {
        console.error("Failed to notify artist:", err);
      });
    }

    return NextResponse.json({ id: booking.id });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");
    const artistId = searchParams.get("artistId");

    if (!customerId && !artistId) {
      return NextResponse.json({ error: "customerId or artistId is required" }, { status: 400 });
    }

    const supabase = await createClient();

    let query = supabase
      .from("bookings")
      .select("*, service_requests(services, locations, budget_range), artists(display_name, avatar_url, studio_address), customers(display_name)")
      .order("created_at", { ascending: false });

    if (customerId) query = query.eq("customer_id", customerId);
    if (artistId) query = query.eq("artist_id", artistId);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Bookings GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
