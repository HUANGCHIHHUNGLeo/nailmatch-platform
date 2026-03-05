import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resolveArtist } from "@/lib/auth/resolve-artist";

export async function GET(request: Request) {
  try {
    const resolved = await resolveArtist(request);
    if (!resolved) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const supabase = await createServiceClient();

    // Get artist profile for matching
    const { data: artist } = await supabase
      .from("artists")
      .select("id, cities, services, gender, min_price, max_price")
      .eq("id", resolved.artistId)
      .single();

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    // Fetch active requests that match this artist's profile
    let query = supabase
      .from("service_requests")
      .select(
        "id, services, locations, budget_range, preferred_date, preferred_time, preferred_styles, status, created_at"
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
