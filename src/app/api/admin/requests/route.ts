import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin/auth";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("service_requests")
    .select("id, customer_id, locations, services, customer_gender, budget_range, preferred_date, preferred_time, status, notified_count, viewed_count, customer_name, customer_phone, consented_at, created_at, customers(display_name)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count responses per request
  const requestIds = (data || []).map((r) => r.id);
  const { data: responses } = await supabase
    .from("artist_responses")
    .select("request_id")
    .in("request_id", requestIds);

  const responseMap: Record<string, number> = {};
  for (const r of responses || []) {
    responseMap[r.request_id] = (responseMap[r.request_id] || 0) + 1;
  }

  const enriched = (data || []).map((r) => ({
    ...r,
    response_count: responseMap[r.id] || 0,
  }));

  return NextResponse.json(enriched);
}
