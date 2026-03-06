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
    .from("service_requests")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("service_requests")
    .select("id, customer_id, locations, services, customer_gender, budget_range, preferred_date, preferred_time, status, notified_count, viewed_count, customer_name, customer_phone, consented_at, created_at, customers(display_name)")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count responses per request
  const requestIds = (data || []).map((r) => r.id);
  let responseMap: Record<string, number> = {};
  if (requestIds.length > 0) {
    const { data: responses } = await supabase
      .from("artist_responses")
      .select("request_id")
      .in("request_id", requestIds);

    for (const r of responses || []) {
      responseMap[r.request_id] = (responseMap[r.request_id] || 0) + 1;
    }
  }

  const enriched = (data || []).map((r) => ({
    ...r,
    response_count: responseMap[r.id] || 0,
  }));

  return NextResponse.json(paginatedResponse(enriched, count || 0, page, limit));
}
