import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin/auth";

export async function GET(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const { parsePagination, paginatedResponse } = await import("@/lib/utils/pagination");
  const { page, limit, from, to } = parsePagination(searchParams);

  const supabase = await createServiceClient();

  const { count } = await supabase
    .from("bookings")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("bookings")
    .select("id, booking_date, booking_time, final_price, status, created_at, artists(display_name), customers(display_name), service_requests(services, locations)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(paginatedResponse(data || [], count || 0, page, limit));
}
