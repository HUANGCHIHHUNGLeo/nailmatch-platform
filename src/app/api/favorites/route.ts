import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resolveCustomer } from "@/lib/auth/resolve-customer";

/**
 * GET /api/favorites
 * List the current customer's favorited artists with artist details.
 */
export async function GET(request: Request) {
  const auth = await resolveCustomer(request);
  if (!auth) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("customer_favorites")
    .select(
      `
      id,
      artist_id,
      created_at,
      artists (
        id,
        display_name,
        avatar_url,
        services,
        styles,
        cities,
        min_price,
        max_price,
        role,
        studio_address
      )
    `
    )
    .eq("customer_id", auth.customerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("favorites GET error:", error);
    return NextResponse.json({ error: "讀取收藏失敗" }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

/**
 * POST /api/favorites
 * Add an artist to the customer's favorites.
 * Body: { artistId: string }
 */
export async function POST(request: Request) {
  const auth = await resolveCustomer(request);
  if (!auth) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.artistId) {
    return NextResponse.json({ error: "缺少 artistId" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("customer_favorites")
    .upsert(
      {
        customer_id: auth.customerId,
        artist_id: body.artistId,
      },
      { onConflict: "customer_id,artist_id" }
    )
    .select()
    .single();

  if (error) {
    console.error("favorites POST error:", error);
    return NextResponse.json({ error: "收藏失敗" }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

/**
 * DELETE /api/favorites
 * Remove an artist from the customer's favorites.
 * Body: { artistId: string }
 */
export async function DELETE(request: Request) {
  const auth = await resolveCustomer(request);
  if (!auth) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.artistId) {
    return NextResponse.json({ error: "缺少 artistId" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("customer_favorites")
    .delete()
    .eq("customer_id", auth.customerId)
    .eq("artist_id", body.artistId);

  if (error) {
    console.error("favorites DELETE error:", error);
    return NextResponse.json({ error: "取消收藏失敗" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
