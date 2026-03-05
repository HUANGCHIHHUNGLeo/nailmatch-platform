import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Try to get authenticated user first
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let artistQuery = supabase
      .from("artists")
      .select("id, cities, services, gender, min_price, max_price");

    if (user) {
      artistQuery = artistQuery.eq("line_user_id", user.id);
    } else {
      // Local dev fallback: get first active artist
      artistQuery = artistQuery.eq("is_active", true).limit(1);
    }

    const { data: artist } = await artistQuery.single();

    if (!artist) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    // Fetch active requests that match this artist's profile
    let query = supabase
      .from("service_requests")
      .select(
        "id, services, locations, budget_range, preferred_date, preferred_styles, status, created_at"
      )
      .in("status", ["pending", "matching"])
      .order("created_at", { ascending: false })
      .limit(20);

    // Filter by location overlap
    if (artist.cities && artist.cities.length > 0) {
      query = query.overlaps("locations", artist.cities);
    }

    // Filter by service overlap
    if (artist.services && artist.services.length > 0) {
      query = query.overlaps("services", artist.services);
    }

    const { data: requests, error } = await query;

    if (error) {
      console.error("Matching requests error:", error);
      return NextResponse.json(
        { error: "Failed to fetch requests" },
        { status: 500 }
      );
    }

    // Filter out requests where this artist already responded
    const { data: existingResponses } = await supabase
      .from("artist_responses")
      .select("request_id")
      .eq("artist_id", artist.id);

    const respondedIds = new Set(
      (existingResponses || []).map((r) => r.request_id)
    );
    const filtered = (requests || []).filter((r) => !respondedIds.has(r.id));

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Matching requests error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
