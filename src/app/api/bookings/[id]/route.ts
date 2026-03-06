import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyReviewPrompt } from "@/lib/line/messaging";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServiceClient();

    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*, service_requests(services, locations, budget_range, preferred_date, preferred_time, preferred_styles), artists(id, display_name, avatar_url, studio_address, phone, instagram_handle, styles), customers(id, display_name), artist_responses(quoted_price, message, available_time)")
      .eq("id", id)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error("Booking GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createServiceClient();

    const allowedStatuses = ["confirmed", "completed", "cancelled", "no_show"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    // If cancelled, update the service request status back to matching
    if (body.status === "cancelled") {
      const { data: booking } = await supabase
        .from("bookings")
        .select("request_id")
        .eq("id", id)
        .single();

      if (booking) {
        await supabase
          .from("service_requests")
          .update({ status: "matching" })
          .eq("id", booking.request_id);
      }
    }

    // If completed, notify customer to leave a review
    if (body.status === "completed") {
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("customer_id, artist_id")
        .eq("id", id)
        .single();

      if (bookingData) {
        const { data: customer } = await supabase
          .from("customers")
          .select("line_user_id")
          .eq("id", bookingData.customer_id)
          .single();

        const { data: artist } = await supabase
          .from("artists")
          .select("display_name")
          .eq("id", bookingData.artist_id)
          .single();

        if (customer?.line_user_id) {
          await notifyReviewPrompt(customer.line_user_id, {
            artistName: artist?.display_name || "設計師",
            bookingId: id,
          }).catch((err) => {
            console.error("Failed to send review prompt:", err);
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
