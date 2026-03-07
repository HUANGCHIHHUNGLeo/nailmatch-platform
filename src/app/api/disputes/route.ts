import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking_id, reporter_type, reporter_id, reason, description } = body;

    if (!booking_id || !reporter_type || !reporter_id || !reason) {
      return NextResponse.json(
        { error: "Missing required fields: booking_id, reporter_type, reporter_id, reason" },
        { status: 400 }
      );
    }

    if (!["customer", "artist"].includes(reporter_type)) {
      return NextResponse.json(
        { error: "reporter_type must be 'customer' or 'artist'" },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    // Verify booking exists and reporter is part of it
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, customer_id, artist_id")
      .eq("id", booking_id)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Verify reporter is the customer or artist on this booking
    if (
      (reporter_type === "customer" && booking.customer_id !== reporter_id) ||
      (reporter_type === "artist" && booking.artist_id !== reporter_id)
    ) {
      return NextResponse.json(
        { error: "Reporter is not part of this booking" },
        { status: 403 }
      );
    }

    // Check for existing open dispute on same booking by same reporter
    const { data: existing } = await supabase
      .from("disputes")
      .select("id")
      .eq("booking_id", booking_id)
      .eq("reporter_id", reporter_id)
      .in("status", ["open", "investigating"])
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json(
        { error: "You already have an open dispute for this booking" },
        { status: 409 }
      );
    }

    const { data: dispute, error } = await supabase
      .from("disputes")
      .insert({
        booking_id,
        reporter_type,
        reporter_id,
        reason,
        description: description || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(dispute, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  // Public GET: allow users to see their own disputes
  const { searchParams } = new URL(request.url);
  const reporter_id = searchParams.get("reporter_id");
  const booking_id = searchParams.get("booking_id");

  if (!reporter_id && !booking_id) {
    return NextResponse.json(
      { error: "Provide reporter_id or booking_id" },
      { status: 400 }
    );
  }

  const supabase = await createServiceClient();

  let query = supabase
    .from("disputes")
    .select("*")
    .order("created_at", { ascending: false });

  if (reporter_id) {
    query = query.eq("reporter_id", reporter_id);
  }
  if (booking_id) {
    query = query.eq("booking_id", booking_id);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
