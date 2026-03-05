import { NextResponse } from "next/server";
import { createClient, createServiceClient } from "@/lib/supabase/server";

async function getArtistId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase.from("artists").select("id");
  if (user) {
    query = query.eq("line_user_id", user.id);
  } else {
    query = query.eq("is_active", true).limit(1);
  }
  const { data } = await query.single();
  return data?.id || null;
}

export async function GET() {
  try {
    const artistId = await getArtistId();
    if (!artistId) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("portfolio_works")
      .select("id, image_url, title, style, price_hint, sort_order, source")
      .eq("artist_id", artistId)
      .order("sort_order", { ascending: true });

    if (error) {
      return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Portfolio GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const artistId = await getArtistId();
    if (!artistId) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const body = await request.json();
    const { image_url, title, style, price_hint } = body;

    if (!image_url) {
      return NextResponse.json({ error: "image_url is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Get current max sort_order
    const { data: maxItem } = await supabase
      .from("portfolio_works")
      .select("sort_order")
      .eq("artist_id", artistId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxItem?.sort_order || 0) + 1;

    const { data, error } = await supabase
      .from("portfolio_works")
      .insert({
        artist_id: artistId,
        image_url,
        title: title || null,
        style: style || null,
        price_hint: price_hint || null,
        sort_order: nextOrder,
        source: "upload",
      })
      .select("id, image_url, title, style, price_hint, sort_order, source")
      .single();

    if (error) {
      console.error("Portfolio insert error:", error);
      return NextResponse.json({ error: "Failed to add portfolio work" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Portfolio POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const artistId = await getArtistId();
    if (!artistId) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify ownership
    const { data: work } = await supabase
      .from("portfolio_works")
      .select("id, image_url")
      .eq("id", id)
      .eq("artist_id", artistId)
      .single();

    if (!work) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }

    // Delete from storage if it's a Supabase URL
    if (work.image_url.includes("supabase.co/storage")) {
      const path = work.image_url.split("/portfolio-images/")[1];
      if (path) {
        const serviceClient = await createServiceClient();
        await serviceClient.storage.from("portfolio-images").remove([path]);
      }
    }

    // Delete from database
    const { error } = await supabase
      .from("portfolio_works")
      .delete()
      .eq("id", id)
      .eq("artist_id", artistId);

    if (error) {
      return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Portfolio DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
