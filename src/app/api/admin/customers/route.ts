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
  const search = searchParams.get("search")?.trim() || "";

  const supabase = await createServiceClient();

  // Build base query with optional search filter
  let countQuery = supabase.from("customers").select("id", { count: "exact", head: true });
  let dataQuery = supabase
    .from("customers")
    .select("id, display_name, line_user_id, phone, email, created_at, terms_accepted_at, is_active");

  if (search) {
    const filter = `display_name.ilike.%${search}%,phone.ilike.%${search}%`;
    countQuery = countQuery.or(filter);
    dataQuery = dataQuery.or(filter);
  }

  const { count } = await countQuery;

  const { data, error } = await dataQuery
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Count requests per customer (only for this page of customers)
  const customerIds = (data || []).map((c) => c.id);
  let requestCountMap: Record<string, number> = {};
  let bookingCountMap: Record<string, number> = {};
  let totalSpendMap: Record<string, number> = {};

  if (customerIds.length > 0) {
    // Request counts
    const { data: requestCounts } = await supabase
      .from("service_requests")
      .select("customer_id")
      .in("customer_id", customerIds);

    for (const r of requestCounts || []) {
      requestCountMap[r.customer_id] = (requestCountMap[r.customer_id] || 0) + 1;
    }

    // Booking counts and total spend from completed bookings
    const { data: bookingData } = await supabase
      .from("bookings")
      .select("customer_id, status, final_price")
      .in("customer_id", customerIds);

    for (const b of bookingData || []) {
      bookingCountMap[b.customer_id] = (bookingCountMap[b.customer_id] || 0) + 1;
      if (b.status === "completed" && b.final_price) {
        totalSpendMap[b.customer_id] = (totalSpendMap[b.customer_id] || 0) + b.final_price;
      }
    }
  }

  const enriched = (data || []).map((c) => ({
    ...c,
    request_count: requestCountMap[c.id] || 0,
    booking_count: bookingCountMap[c.id] || 0,
    total_spend: totalSpendMap[c.id] || 0,
    has_line: !!c.line_user_id,
    is_active: c.is_active !== false, // default to true if column doesn't exist yet
  }));

  return NextResponse.json(paginatedResponse(enriched, count || 0, page, limit));
}

export async function PATCH(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { customer_id, is_active } = body;

  if (!customer_id || typeof is_active !== "boolean") {
    return NextResponse.json({ error: "Missing customer_id or is_active" }, { status: 400 });
  }

  const supabase = await createServiceClient();

  const { error } = await supabase
    .from("customers")
    .update({ is_active })
    .eq("id", customer_id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
