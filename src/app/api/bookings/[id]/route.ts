import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyReviewPrompt, notifyBookingCancelled, notifyBookingReschedule } from "@/lib/line/messaging";

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

    // Handle reschedule
    if (body.reschedule) {
      const { newDate, newTime, requestedBy } = body.reschedule;
      if (!newDate || !newTime) {
        return NextResponse.json({ error: "Missing newDate or newTime" }, { status: 400 });
      }

      // Update booking date/time
      const { error: updateErr } = await supabase
        .from("bookings")
        .update({ booking_date: newDate, booking_time: newTime })
        .eq("id", id);

      if (updateErr) {
        return NextResponse.json({ error: "Failed to reschedule" }, { status: 500 });
      }

      // Fetch booking details for notification
      const { data: bookingData } = await supabase
        .from("bookings")
        .select("customer_id, artist_id, booking_date")
        .eq("id", id)
        .single();

      if (bookingData) {
        const [{ data: customer }, { data: artist }] = await Promise.all([
          supabase.from("customers").select("line_user_id").eq("id", bookingData.customer_id).single(),
          supabase.from("artists").select("line_user_id, display_name").eq("id", bookingData.artist_id).single(),
        ]);

        const rescheduleInfo = {
          requestedBy: requestedBy || "對方",
          artistName: artist?.display_name || "設計師",
          oldDate: bookingData.booking_date || "未定",
          newDate,
          newTime,
          bookingId: id,
        };

        // Notify the OTHER party
        const notifications: Promise<unknown>[] = [];
        if (requestedBy === "客戶" && artist?.line_user_id) {
          notifications.push(notifyBookingReschedule(artist.line_user_id, rescheduleInfo));
        } else if (requestedBy === "設計師" && customer?.line_user_id) {
          notifications.push(notifyBookingReschedule(customer.line_user_id, rescheduleInfo));
        }
        await Promise.allSettled(notifications);
      }

      return NextResponse.json({ success: true, rescheduled: true });
    }

    // Handle status update
    const allowedStatuses = ["confirmed", "completed", "cancelled", "no_show"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (body.status) updateData.status = body.status;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No update data" }, { status: 400 });
    }

    const { error } = await supabase
      .from("bookings")
      .update(updateData)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to update booking" }, { status: 500 });
    }

    // Fetch booking details for notifications
    const { data: bookingData } = await supabase
      .from("bookings")
      .select("customer_id, artist_id, request_id, booking_date, service_requests(services)")
      .eq("id", id)
      .single();

    // If cancelled, update the service request status back to matching + notify
    if (body.status === "cancelled" && bookingData) {
      await supabase
        .from("service_requests")
        .update({ status: "matching" })
        .eq("id", bookingData.request_id);

      const [{ data: customer }, { data: artist }] = await Promise.all([
        supabase.from("customers").select("line_user_id").eq("id", bookingData.customer_id).single(),
        supabase.from("artists").select("line_user_id, display_name").eq("id", bookingData.artist_id).single(),
      ]);

      const sr = Array.isArray(bookingData.service_requests)
        ? bookingData.service_requests[0]
        : bookingData.service_requests;
      const cancelInfo = {
        cancelledBy: body.cancelledBy || "對方",
        artistName: artist?.display_name || "設計師",
        services: sr?.services || [],
        bookingDate: bookingData.booking_date || "未定",
        bookingId: id,
      };

      // Notify the OTHER party (or both if cancelledBy not specified)
      const notifications: Promise<unknown>[] = [];
      if (body.cancelledBy === "客戶" && artist?.line_user_id) {
        notifications.push(notifyBookingCancelled(artist.line_user_id, cancelInfo));
      } else if (body.cancelledBy === "設計師" && customer?.line_user_id) {
        notifications.push(notifyBookingCancelled(customer.line_user_id, cancelInfo));
      } else {
        // Notify both if unclear who cancelled
        if (customer?.line_user_id) notifications.push(notifyBookingCancelled(customer.line_user_id, cancelInfo));
        if (artist?.line_user_id) notifications.push(notifyBookingCancelled(artist.line_user_id, cancelInfo));
      }
      await Promise.allSettled(notifications);
    }

    // If completed, notify customer to leave a review
    if (body.status === "completed" && bookingData) {
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Booking PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
