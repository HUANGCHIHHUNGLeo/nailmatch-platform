import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { checkRateLimit, getClientIp } from "@/lib/utils/rate-limit";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createServiceClient();

    // Fetch request with customer info (exclude PII like line_user_id)
    const { data: serviceRequest, error } = await supabase
      .from("service_requests")
      .select("*, customers(id, display_name)")
      .eq("id", id)
      .single();

    if (error || !serviceRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Fetch responses with artist info and portfolio
    const { data: responses } = await supabase
      .from("artist_responses")
      .select("*, artists(id, display_name, avatar_url, studio_address, instagram_handle, styles, cities, services)")
      .eq("request_id", id)
      .order("created_at", { ascending: false });

    // Fetch portfolio works for each artist that responded
    const artistIds = (responses || []).map((r) => r.artists?.id).filter(Boolean);
    const portfolioMap: Record<string, { image_url: string; title: string | null; style: string | null }[]> = {};

    if (artistIds.length > 0) {
      const { data: portfolios } = await supabase
        .from("portfolio_works")
        .select("artist_id, image_url, title, style")
        .in("artist_id", artistIds)
        .order("sort_order", { ascending: true });

      for (const pw of portfolios || []) {
        if (!portfolioMap[pw.artist_id]) portfolioMap[pw.artist_id] = [];
        portfolioMap[pw.artist_id].push(pw);
      }
    }

    // Attach portfolio to each response
    const responsesWithPortfolio = (responses || []).map((r) => ({
      ...r,
      artists: r.artists
        ? { ...r.artists, portfolio_works: portfolioMap[r.artists.id] || [] }
        : null,
    }));

    return NextResponse.json({
      ...serviceRequest,
      responses: responsesWithPortfolio,
    });
  } catch (error) {
    console.error("Request GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const supabase = await createServiceClient();

    const updateData: Record<string, unknown> = {};

    if (body.status) updateData.status = body.status;
    if (body.increment_viewed) {
      // Rate-limit viewed_count: same IP can only count once per 10 minutes per request
      const viewIp = getClientIp(request);
      const viewRl = checkRateLimit(`view:${id}:${viewIp}`, { windowMs: 600_000, max: 1 });
      if (viewRl.allowed) {
        const { data: current } = await supabase
          .from("service_requests")
          .select("viewed_count")
          .eq("id", id)
          .single();

        updateData.viewed_count = (current?.viewed_count || 0) + 1;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No update data" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("service_requests")
      .update(updateData)
      .eq("id", id)
      .select("id, status, viewed_count, notified_count")
      .single();

    if (error) {
      return NextResponse.json({ error: "Failed to update request" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Request PATCH error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
