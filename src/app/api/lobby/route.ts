import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export async function GET(request: Request) {
  const ip = getClientIp(request);
  const rl = checkRateLimit(`lobby:${ip}`);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const { parsePagination, paginatedResponse } = await import("@/lib/utils/pagination");
  const { page, limit, from, to } = parsePagination(searchParams);

  const supabase = await createServiceClient();

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
  const cutoff = fourteenDaysAgo.toISOString();

  // Count
  const { count } = await supabase
    .from("service_requests")
    .select("id", { count: "exact", head: true })
    .in("status", ["pending", "matching"])
    .gte("created_at", cutoff);

  // Data — only non-PII fields
  const { data, error } = await supabase
    .from("service_requests")
    .select("id, services, locations, budget_range, preferred_date, preferred_time, preferred_styles, nail_length, status, created_at")
    .in("status", ["pending", "matching"])
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Response counts
  const requestIds = (data || []).map((r) => r.id);
  const responseMap: Record<string, number> = {};

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

  return NextResponse.json(paginatedResponse(enriched, count || 0, page, limit), {
    headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=30" },
  });
}
