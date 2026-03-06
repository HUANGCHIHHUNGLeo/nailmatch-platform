import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServiceClient();

    // Fetch artist profile with portfolio
    const { data: artist, error } = await supabase
      .from("artists")
      .select(
        "id, display_name, avatar_url, bio, gender, cities, service_location_type, studio_address, services, styles, min_price, max_price, instagram_handle, line_id, payment_methods, is_verified, is_active"
      )
      .eq("id", id)
      .single();

    if (error || !artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    if (!artist.is_active || !artist.is_verified) {
      return NextResponse.json({ error: "Artist not available" }, { status: 404 });
    }

    // Fetch portfolio works
    const { data: portfolio } = await supabase
      .from("portfolio_works")
      .select("id, image_url, title, style, price_hint")
      .eq("artist_id", id)
      .order("sort_order", { ascending: true });

    // Remove internal fields
    const { is_verified, is_active, ...publicProfile } = artist;

    return NextResponse.json({
      ...publicProfile,
      portfolio: portfolio || [],
    });
  } catch (error) {
    console.error("Artist detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
