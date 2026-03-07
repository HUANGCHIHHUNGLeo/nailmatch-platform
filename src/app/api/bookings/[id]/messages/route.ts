import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resolveCustomer } from "@/lib/auth/resolve-customer";
import { resolveArtist } from "@/lib/auth/resolve-artist";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: bookingId } = await params;
  const supabase = await createServiceClient();

  // Auth: either customer or artist who belongs to this booking
  const customer = await resolveCustomer(request);
  const artist = await resolveArtist(request);

  if (!customer && !artist) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Verify the booking belongs to this user
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id, artist_id")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  const isCustomer = customer && booking.customer_id === customer.customerId;
  const isArtist = artist && booking.artist_id === artist.artistId;

  if (!isCustomer && !isArtist) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data: messages, error } = await supabase
    .from("booking_messages")
    .select("id, sender_type, message, created_at")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(messages || []);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`booking-msg:${ip}`, { windowMs: 60_000, max: 20 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "請求過於頻繁，請稍後再試" }, { status: 429 });
  }

  const { id: bookingId } = await params;
  const supabase = await createServiceClient();

  // Auth
  const customer = await resolveCustomer(request);
  const artist = await resolveArtist(request);

  if (!customer && !artist) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Verify ownership
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, customer_id, artist_id, status")
    .eq("id", bookingId)
    .single();

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  if (!["confirmed", "completed"].includes(booking.status)) {
    return NextResponse.json({ error: "只有已確認的預約才能留言" }, { status: 400 });
  }

  const isCustomer = customer && booking.customer_id === customer.customerId;
  const isArtist = artist && booking.artist_id === artist.artistId;

  if (!isCustomer && !isArtist) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const message = (body.message || "").trim();

  if (!message || message.length > 500) {
    return NextResponse.json({ error: "留言內容不可為空且最多 500 字" }, { status: 400 });
  }

  const senderType = isCustomer ? "customer" : "artist";
  const senderId = isCustomer ? customer!.customerId : artist!.artistId;

  const { data, error } = await supabase
    .from("booking_messages")
    .insert({
      booking_id: bookingId,
      sender_type: senderType,
      sender_id: senderId,
      message,
    })
    .select("id, sender_type, message, created_at")
    .single();

  if (error) {
    console.error("Message insert error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json(data);
}
