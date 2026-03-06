import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resolveArtist } from "@/lib/auth/resolve-artist";

const ARTIST_SELECT =
  "id, display_name, avatar_url, services, styles, cities, min_price, max_price, gender, bio, phone, email, service_location_type, studio_address, instagram_handle, is_active, is_verified, payment_methods";

export async function GET(request: Request) {
  try {
    const resolved = await resolveArtist(request);
    if (!resolved) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const supabase = await createServiceClient();
    const { data: artist, error } = await supabase
      .from("artists")
      .select(ARTIST_SELECT)
      .eq("id", resolved.artistId)
      .single();

    if (error || !artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error("Artists me error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const resolved = await resolveArtist(request);
    if (!resolved) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const body = await request.json();
    const supabase = await createServiceClient();

    // Only allow updating specific fields
    const allowedFields: Record<string, unknown> = {};
    const updatable = [
      "display_name",
      "bio",
      "phone",
      "email",
      "gender",
      "cities",
      "service_location_type",
      "studio_address",
      "services",
      "styles",
      "min_price",
      "max_price",
      "instagram_handle",
      "avatar_url",
      "is_active",
      "payment_methods",
    ];

    for (const field of updatable) {
      if (body[field] !== undefined) {
        allowedFields[field] = body[field];
      }
    }

    if (Object.keys(allowedFields).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    allowedFields.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("artists")
      .update(allowedFields)
      .eq("id", resolved.artistId)
      .select(ARTIST_SELECT)
      .single();

    if (error) {
      console.error("Artist update error:", error);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Artist PUT error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
