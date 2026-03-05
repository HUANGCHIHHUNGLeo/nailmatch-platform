import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Try to get authenticated user first
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let query = supabase
      .from("artists")
      .select(
        "id, display_name, avatar_url, services, styles, cities, min_price, max_price, gender, bio, phone, email, service_location_type, studio_address, instagram_handle"
      );

    if (user) {
      // Production: get artist by authenticated user's ID
      query = query.eq("line_user_id", user.id);
    } else {
      // Local dev fallback: get first active artist
      query = query.eq("is_active", true).limit(1);
    }

    const { data: artist, error } = await query.single();

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
    const supabase = await createClient();
    const body = await request.json();

    // Try to get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Find the artist
    let findQuery = supabase.from("artists").select("id");
    if (user) {
      findQuery = findQuery.eq("line_user_id", user.id);
    } else {
      findQuery = findQuery.eq("is_active", true).limit(1);
    }
    const { data: artist } = await findQuery.single();

    if (!artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

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
      .eq("id", artist.id)
      .select(
        "id, display_name, avatar_url, services, styles, cities, min_price, max_price, gender, bio, phone, email, service_location_type, studio_address, instagram_handle"
      )
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
