import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin/auth";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const { data, error } = await supabase
    .from("customers")
    .select("id, display_name, line_user_id, phone, email, created_at, terms_accepted_at, privacy_accepted_at")
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count requests per customer
  const { data: requestCounts } = await supabase
    .from("service_requests")
    .select("customer_id");

  const countMap: Record<string, number> = {};
  for (const r of requestCounts || []) {
    countMap[r.customer_id] = (countMap[r.customer_id] || 0) + 1;
  }

  const enriched = (data || []).map((c) => ({
    ...c,
    request_count: countMap[c.id] || 0,
    has_line: !!c.line_user_id,
  }));

  return NextResponse.json(enriched);
}
