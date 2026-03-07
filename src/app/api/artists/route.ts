import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { artistRegistrationSchema } from "@/lib/utils/form-schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lineProfile, role, consentAccepted, ...formData } = body;

    const parsed = artistRegistrationSchema.safeParse(formData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();
    const lineUserId = lineProfile?.userId || null;

    const artistData = {
      line_user_id: lineUserId,
      display_name: parsed.data.displayName,
      avatar_url: lineProfile?.pictureUrl || null,
      gender: parsed.data.gender,
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      bio: parsed.data.bio || null,
      cities: parsed.data.cities,
      service_location_type: parsed.data.serviceLocationType,
      studio_address: parsed.data.studioAddress || null,
      services: parsed.data.services,
      styles: parsed.data.styles,
      min_price: parsed.data.minPrice,
      max_price: parsed.data.maxPrice,
      instagram_handle: parsed.data.instagramHandle || null,
      line_id: parsed.data.lineId || null,
      payment_methods: parsed.data.paymentMethods || [],
      role: role || "nail",
      updated_at: new Date().toISOString(),
    };

    // Check if artist with same LINE user ID already exists
    if (lineUserId) {
      const { data: existing } = await supabase
        .from("artists")
        .select("id")
        .eq("line_user_id", lineUserId)
        .single();

      if (existing) {
        // Update existing artist instead of creating duplicate
        const { error: updateError } = await supabase
          .from("artists")
          .update(artistData)
          .eq("id", existing.id);

        if (updateError) {
          console.error("Artist update error:", updateError);
          return NextResponse.json({ error: "Update failed", detail: updateError.message }, { status: 500 });
        }
        return NextResponse.json({ id: existing.id, updated: true });
      }
    }

    // New registration
    const { data: artist, error } = await supabase
      .from("artists")
      .insert({
        ...artistData,
        is_verified: false,
        is_active: true,
        terms_accepted_at: consentAccepted ? new Date().toISOString() : null,
        privacy_accepted_at: consentAccepted ? new Date().toISOString() : null,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Artist registration error:", error);
      return NextResponse.json({ error: "Registration failed", detail: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: artist.id });
  } catch (error) {
    console.error("Artist API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const { parsePagination, paginatedResponse } = await import("@/lib/utils/pagination");
    const { page, limit, from, to } = parsePagination(searchParams);

    const supabase = await createServiceClient();

    const { count } = await supabase
      .from("artists")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("is_verified", true);

    const { data, error } = await supabase
      .from("artists")
      .select("id, display_name, avatar_url, services, styles, min_price, max_price, cities, role, studio_address, payment_methods, instagram_handle")
      .eq("is_active", true)
      .eq("is_verified", true)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
    }

    return NextResponse.json(paginatedResponse(data || [], count || 0, page, limit), {
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60" },
    });
  } catch (error) {
    console.error("Artists GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
