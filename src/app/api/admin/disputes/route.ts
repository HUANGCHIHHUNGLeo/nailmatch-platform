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
  const statusFilter = searchParams.get("status");

  const supabase = await createServiceClient();

  // Count
  let countQuery = supabase
    .from("disputes")
    .select("id", { count: "exact", head: true });

  if (statusFilter) {
    countQuery = countQuery.eq("status", statusFilter);
  }

  const { count } = await countQuery;

  // Fetch disputes
  let query = supabase
    .from("disputes")
    .select("*")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data: disputes, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Enrich with booking + reporter details
  const bookingIds = [...new Set((disputes || []).map((d) => d.booking_id))];
  const reporterCustomerIds = (disputes || [])
    .filter((d) => d.reporter_type === "customer")
    .map((d) => d.reporter_id);
  const reporterArtistIds = (disputes || [])
    .filter((d) => d.reporter_type === "artist")
    .map((d) => d.reporter_id);

  // Fetch booking info
  let bookingMap: Record<string, { customer_name: string; artist_name: string; services: string[]; status: string }> = {};
  if (bookingIds.length > 0) {
    const { data: bookingData } = await supabase
      .from("bookings")
      .select("id, status, customers(display_name), artists(display_name), service_requests(services)")
      .in("id", bookingIds);

    for (const b of bookingData || []) {
      const customer = Array.isArray(b.customers) ? b.customers[0] : b.customers;
      const artist = Array.isArray(b.artists) ? b.artists[0] : b.artists;
      const sr = Array.isArray(b.service_requests) ? b.service_requests[0] : b.service_requests;
      bookingMap[b.id] = {
        customer_name: (customer as { display_name: string } | null)?.display_name || "匿名",
        artist_name: (artist as { display_name: string } | null)?.display_name || "-",
        services: (sr as { services: string[] } | null)?.services || [],
        status: b.status,
      };
    }
  }

  // Fetch reporter names
  let reporterNameMap: Record<string, string> = {};
  if (reporterCustomerIds.length > 0) {
    const { data: custData } = await supabase
      .from("customers")
      .select("id, display_name")
      .in("id", reporterCustomerIds);
    for (const c of custData || []) {
      reporterNameMap[c.id] = c.display_name;
    }
  }
  if (reporterArtistIds.length > 0) {
    const { data: artData } = await supabase
      .from("artists")
      .select("id, display_name")
      .in("id", reporterArtistIds);
    for (const a of artData || []) {
      reporterNameMap[a.id] = a.display_name;
    }
  }

  const enriched = (disputes || []).map((d) => ({
    ...d,
    booking_info: bookingMap[d.booking_id] || null,
    reporter_name: reporterNameMap[d.reporter_id] || "未知",
  }));

  return NextResponse.json(paginatedResponse(enriched, count || 0, page, limit));
}

export async function PATCH(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { dispute_id, status, admin_notes, resolution } = body;

    if (!dispute_id) {
      return NextResponse.json({ error: "Missing dispute_id" }, { status: 400 });
    }

    if (status && !["open", "investigating", "resolved", "dismissed"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const supabase = await createServiceClient();

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (admin_notes !== undefined) updateData.admin_notes = admin_notes;
    if (resolution !== undefined) updateData.resolution = resolution;
    if (status === "resolved" || status === "dismissed") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("disputes")
      .update(updateData)
      .eq("id", dispute_id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
