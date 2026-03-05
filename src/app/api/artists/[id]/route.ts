import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: artist, error } = await supabase
      .from("artists")
      .select("*, portfolio_works(id, image_url, title, style, sort_order)")
      .eq("id", id)
      .single();

    if (error || !artist) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    return NextResponse.json(artist);
  } catch (error) {
    console.error("Artist GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
