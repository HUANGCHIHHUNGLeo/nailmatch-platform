import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resolveArtist } from "@/lib/auth/resolve-artist";

export async function GET(request: Request) {
  try {
    const resolved = await resolveArtist(request);
    if (!resolved) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const supabase = await createServiceClient();
    let query = supabase
      .from("availability_slots")
      .select("id, date, start_time, end_time, is_booked")
      .eq("artist_id", resolved.artistId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true });

    if (from) query = query.gte("date", from);
    if (to) query = query.lte("date", to);

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Availability GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const resolved = await resolveArtist(request);
    if (!resolved) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const body = await request.json();
    const { date, start_time, end_time } = body;

    if (!date || !start_time || !end_time) {
      return NextResponse.json({ error: "date, start_time, end_time are required" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from("availability_slots")
      .insert({
        artist_id: resolved.artistId,
        date,
        start_time,
        end_time,
        is_booked: false,
      })
      .select("id, date, start_time, end_time, is_booked")
      .single();

    if (error) {
      console.error("Availability insert error:", error);
      return NextResponse.json({ error: "Failed to create slot" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Availability POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const resolved = await resolveArtist(request);
    if (!resolved) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    // Verify ownership and not booked
    const { data: slot } = await supabase
      .from("availability_slots")
      .select("id, is_booked")
      .eq("id", id)
      .eq("artist_id", resolved.artistId)
      .single();

    if (!slot) {
      return NextResponse.json({ error: "Slot not found" }, { status: 404 });
    }

    if (slot.is_booked) {
      return NextResponse.json({ error: "Cannot delete a booked slot" }, { status: 400 });
    }

    const { error } = await supabase
      .from("availability_slots")
      .delete()
      .eq("id", id)
      .eq("artist_id", resolved.artistId);

    if (error) {
      return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Availability DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
