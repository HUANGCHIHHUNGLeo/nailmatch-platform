import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bookingId, artistId, customerId, rating, comment } = body;

    if (!bookingId || !artistId || !customerId || !rating) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Verify booking exists and is completed
    const { data: booking } = await supabase
      .from("bookings")
      .select("id, status")
      .eq("id", bookingId)
      .eq("customer_id", customerId)
      .single();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.status !== "completed") {
      return NextResponse.json({ error: "Can only review completed bookings" }, { status: 400 });
    }

    // Check if already reviewed
    const { data: existing } = await supabase
      .from("reviews")
      .select("id")
      .eq("booking_id", bookingId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Already reviewed" }, { status: 400 });
    }

    const { data: review, error } = await supabase
      .from("reviews")
      .insert({
        booking_id: bookingId,
        artist_id: artistId,
        customer_id: customerId,
        rating,
        comment: comment || null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Review insert error:", error);
      return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
    }

    return NextResponse.json({ id: review.id });
  } catch (error) {
    console.error("Review API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Get reviews for an artist
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get("artistId");

    if (!artistId) {
      return NextResponse.json({ error: "artistId is required" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("reviews")
      .select("id, rating, comment, created_at, customers(display_name)")
      .eq("artist_id", artistId)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
    }

    // Calculate average rating
    const reviews = data || [];
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

    return NextResponse.json({
      reviews,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Reviews GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
