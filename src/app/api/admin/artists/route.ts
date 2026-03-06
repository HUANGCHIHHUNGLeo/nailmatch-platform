import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { notifyArtistApproved, notifyArtistRejected } from "@/lib/line/messaging";
import { linkArtistRichMenu, unlinkArtistRichMenu } from "@/lib/line/richmenu";

export async function GET(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const { parsePagination, paginatedResponse } = await import("@/lib/utils/pagination");
  const { page, limit, from, to } = parsePagination(searchParams);

  const supabase = await createServiceClient();

  const { count } = await supabase
    .from("artists")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("artists")
    .select("id, display_name, avatar_url, phone, email, gender, cities, services, styles, min_price, max_price, instagram_handle, line_id, role, studio_address, service_location_type, bio, line_user_id, is_verified, is_active, created_at, payment_methods")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(paginatedResponse(data || [], count || 0, page, limit));
}

export async function PATCH(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, action } = await request.json();

    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const isApproved = action === "approve";

    const updateFields: Record<string, unknown> = {
      is_verified: isApproved,
      updated_at: new Date().toISOString(),
    };

    if (!isApproved) {
      updateFields.is_active = false;
    }

    const { data: artist, error } = await supabase
      .from("artists")
      .update(updateFields)
      .eq("id", id)
      .select("id, display_name, line_user_id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Send LINE notification + switch Rich Menu
    if (artist.line_user_id) {
      try {
        if (isApproved) {
          await notifyArtistApproved(artist.line_user_id, artist.display_name);
          await linkArtistRichMenu(artist.line_user_id).catch(() => {});
        } else {
          await notifyArtistRejected(artist.line_user_id);
          await unlinkArtistRichMenu(artist.line_user_id).catch(() => {});
        }
      } catch (lineError) {
        console.error("Failed to send LINE notification:", lineError);
      }
    }

    return NextResponse.json({ success: true, artist });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
