import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin/auth";
import { parsePagination, paginatedResponse } from "@/lib/utils/pagination";

export async function GET(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const { page, limit, from, to } = parsePagination(searchParams);

  const supabase = await createServiceClient();

  const { count } = await supabase
    .from("artist_responses")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("artist_responses")
    .select(`
      id, quoted_price, message, available_time, status, created_at,
      artists(id, display_name),
      service_requests(id, services, locations, budget_range, customer_id, customer_name, customer_phone,
        customers(display_name, line_user_id)
      )
    `)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Check if each quote's customer has LINE for notification status
  const enriched = (data || []).map((r) => {
    const sr = Array.isArray(r.service_requests) ? r.service_requests[0] : r.service_requests;
    const customer = sr?.customers;
    const customerObj = Array.isArray(customer) ? customer[0] : customer;
    return {
      ...r,
      customer_name: sr?.customer_name || customerObj?.display_name || "匿名",
      has_line: !!customerObj?.line_user_id,
    };
  });

  return NextResponse.json(paginatedResponse(enriched, count || 0, page, limit));
}
