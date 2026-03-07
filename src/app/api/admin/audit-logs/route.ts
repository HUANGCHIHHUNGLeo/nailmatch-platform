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
    .from("audit_logs")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("audit_logs")
    .select("id, action, entity_type, entity_id, details, ip_address, created_at")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(paginatedResponse(data || [], count || 0, page, limit));
}
