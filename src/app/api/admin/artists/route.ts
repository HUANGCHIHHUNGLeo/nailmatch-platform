import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { pushMessage } from "@/lib/line/messaging";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("artists")
    .select("id, display_name, avatar_url, phone, email, gender, cities, services, styles, min_price, max_price, instagram_handle, line_id, role, studio_address, service_location_type, bio, line_user_id, is_verified, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
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

    // Send LINE notification to artist
    if (artist.line_user_id) {
      try {
        if (isApproved) {
          await pushMessage(
            artist.line_user_id,
            `恭喜！${artist.display_name}，您的美甲師帳號已通過審核 🎉\n\n您現在可以開始接單了！有新的顧客需求時，我們會立即通知您。`
          );
        } else {
          await pushMessage(
            artist.line_user_id,
            `${artist.display_name}，很抱歉您的美甲師申請未通過審核。\n\n如有疑問，請聯繫我們的客服。`
          );
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
