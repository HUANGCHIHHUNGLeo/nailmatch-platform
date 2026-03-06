import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { artistRegistrationSchema } from "@/lib/utils/form-schema";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lineProfile, role, ...formData } = body;

    const parsed = artistRegistrationSchema.safeParse(formData);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid data", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const supabase = await createServiceClient();

    const { data: artist, error } = await supabase
      .from("artists")
      .insert({
        line_user_id: lineProfile?.userId || null,
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
        is_verified: false,
        is_active: true,
        updated_at: new Date().toISOString(),
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

export async function GET() {
  try {
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("artists")
      .select("id, display_name, avatar_url, services, styles, min_price, max_price, cities")
      .eq("is_active", true)
      .eq("is_verified", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch artists" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Artists GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
