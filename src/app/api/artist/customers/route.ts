import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resolveArtist } from "@/lib/auth/resolve-artist";

/**
 * GET /api/artist/customers
 * List the current artist's customer notes.
 */
export async function GET(request: Request) {
  const auth = await resolveArtist(request);
  if (!auth) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("artist_customer_notes")
    .select(
      `
      id,
      customer_id,
      note,
      tags,
      last_service_date,
      visit_count,
      created_at,
      updated_at,
      customers (
        id,
        display_name,
        avatar_url,
        phone
      )
    `
    )
    .eq("artist_id", auth.artistId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("artist customers GET error:", error);
    return NextResponse.json({ error: "讀取客戶資料失敗" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/artist/customers
 * Create or update a customer note (upsert on artist_id + customer_id).
 * Body: { customerId, note?, tags?, lastServiceDate?, visitCount? }
 */
export async function POST(request: Request) {
  const auth = await resolveArtist(request);
  if (!auth) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.customerId) {
    return NextResponse.json({ error: "缺少 customerId" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const upsertData: Record<string, unknown> = {
    artist_id: auth.artistId,
    customer_id: body.customerId,
    updated_at: new Date().toISOString(),
  };

  if (body.note !== undefined) upsertData.note = body.note;
  if (body.tags !== undefined) upsertData.tags = body.tags;
  if (body.lastServiceDate !== undefined) upsertData.last_service_date = body.lastServiceDate;
  if (body.visitCount !== undefined) upsertData.visit_count = body.visitCount;

  const { data, error } = await supabase
    .from("artist_customer_notes")
    .upsert(upsertData, { onConflict: "artist_id,customer_id" })
    .select()
    .single();

  if (error) {
    console.error("artist customers POST error:", error);
    return NextResponse.json({ error: "儲存客戶資料失敗" }, { status: 500 });
  }

  return NextResponse.json(data);
}
