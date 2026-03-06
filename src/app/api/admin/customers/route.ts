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
    .from("customers")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("customers")
    .select("id, display_name, line_user_id, phone, email, created_at, terms_accepted_at, privacy_accepted_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count requests per customer (only for this page of customers)
  const customerIds = (data || []).map((c) => c.id);
  let countMap: Record<string, number> = {};
  if (customerIds.length > 0) {
    const { data: requestCounts } = await supabase
      .from("service_requests")
      .select("customer_id")
      .in("customer_id", customerIds);

    for (const r of requestCounts || []) {
      countMap[r.customer_id] = (countMap[r.customer_id] || 0) + 1;
    }
  }

  const enriched = (data || []).map((c) => ({
    ...c,
    request_count: countMap[c.id] || 0,
    has_line: !!c.line_user_id,
  }));

  return NextResponse.json(paginatedResponse(enriched, count || 0, page, limit));
}
