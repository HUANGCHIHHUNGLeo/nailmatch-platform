import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resolveArtist } from "@/lib/auth/resolve-artist";

export async function GET(request: Request) {
  const resolved = await resolveArtist(request);
  if (!resolved) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("artist_responses")
    .select(`
      id, quoted_price, message, available_time, status, created_at,
      service_requests(id, services, locations, budget_range, preferred_date, status,
        customers(display_name)
      )
    `)
    .eq("artist_id", resolved.artistId)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data || []);
}
