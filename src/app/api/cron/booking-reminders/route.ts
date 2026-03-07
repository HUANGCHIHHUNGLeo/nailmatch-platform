import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyBookingReminder } from "@/lib/line/messaging";

// Vercel Cron calls this daily (morning) to send booking reminders
// Sends reminders for bookings happening today and tomorrow
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  // Calculate today and tomorrow in Taiwan time (UTC+8)
  const now = new Date();
  const todayStr = now.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });

  // Fetch confirmed bookings for today and tomorrow
  const { data: bookings, error } = await supabase
    .from("bookings")
    .select(
      "id, booking_date, booking_time, customer_id, artist_id, artists(line_user_id, display_name, studio_address), customers(line_user_id)"
    )
    .eq("status", "confirmed")
    .in("booking_date", [todayStr, tomorrowStr]);

  if (error) {
    console.error("Booking reminders: fetch error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  let sentCount = 0;
  const notifications: Promise<unknown>[] = [];

  for (const booking of bookings || []) {
    const artist = Array.isArray(booking.artists) ? booking.artists[0] : booking.artists;
    const customer = Array.isArray(booking.customers) ? booking.customers[0] : booking.customers;
    const isToday = booking.booking_date === todayStr;

    const reminderInfo = {
      artistName: artist?.display_name || "設計師",
      bookingDate: booking.booking_date || "待確認",
      bookingTime: booking.booking_time || "",
      location: artist?.studio_address || "待確認",
      bookingId: booking.id,
      isToday,
    };

    // Notify customer
    if (customer?.line_user_id) {
      notifications.push(
        notifyBookingReminder(customer.line_user_id, reminderInfo).catch((err) =>
          console.error(`Reminder failed for customer (booking ${booking.id}):`, err)
        )
      );
      sentCount++;
    }

    // Notify artist
    if (artist?.line_user_id) {
      notifications.push(
        notifyBookingReminder(artist.line_user_id, {
          ...reminderInfo,
          artistName: "您",
        }).catch((err) =>
          console.error(`Reminder failed for artist (booking ${booking.id}):`, err)
        )
      );
      sentCount++;
    }
  }

  await Promise.allSettled(notifications);

  return NextResponse.json({
    ok: true,
    bookingsFound: (bookings || []).length,
    notificationsSent: sentCount,
  });
}
