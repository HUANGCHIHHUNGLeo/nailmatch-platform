import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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

export async function GET(request: Request) {
  try {
    const artistId = await getArtistId();
    if (!artistId) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get("from"); // YYYY-MM-DD
    const to = searchParams.get("to"); // YYYY-MM-DD

    const supabase = await createClient();
    let query = supabase
      .from("availability_slots")
      .select("id, date, start_time, end_time, is_booked")
      .eq("artist_id", artistId)
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
    const artistId = await getArtistId();
    if (!artistId) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }

    const body = await request.json();
    const { date, start_time, end_time } = body;

    if (!date || !start_time || !end_time) {
      return NextResponse.json({ error: "date, start_time, end_time are required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("availability_slots")
      .insert({
        artist_id: artistId,
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

    // Verify ownership and not booked
    const { data: slot } = await supabase
      .from("availability_slots")
      .select("id, is_booked")
      .eq("id", id)
      .eq("artist_id", artistId)
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
      .eq("artist_id", artistId);

    if (error) {
      return NextResponse.json({ error: "Failed to delete slot" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Availability DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
