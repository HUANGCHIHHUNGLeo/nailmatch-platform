import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin/auth";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const since = thirtyDaysAgo.toISOString();

  // Fetch recent data for trend analysis
  const [customersRes, requestsRes, bookingsRes, responsesRes, reviewsRes] =
    await Promise.all([
      supabase
        .from("customers")
        .select("created_at")
        .gte("created_at", since),
      supabase
        .from("service_requests")
        .select("created_at, status, services, locations, budget_range")
        .gte("created_at", since),
      supabase
        .from("bookings")
        .select("created_at, status, final_price")
        .gte("created_at", since),
      supabase
        .from("artist_responses")
        .select("created_at")
        .gte("created_at", since),
      supabase
        .from("reviews")
        .select("rating, created_at")
        .gte("created_at", since),
    ]);

  // Build daily counts for last 30 days
  const dailyCounts: Record<
    string,
    { customers: number; requests: number; bookings: number; responses: number }
  > = {};
  for (let i = 0; i < 30; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
    dailyCounts[key] = { customers: 0, requests: 0, bookings: 0, responses: 0 };
  }

  const toTWDate = (iso: string) =>
    new Date(iso).toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });

  for (const c of customersRes.data || []) {
    const key = toTWDate(c.created_at);
    if (dailyCounts[key]) dailyCounts[key].customers++;
  }
  for (const r of requestsRes.data || []) {
    const key = toTWDate(r.created_at);
    if (dailyCounts[key]) dailyCounts[key].requests++;
  }
  for (const b of bookingsRes.data || []) {
    const key = toTWDate(b.created_at);
    if (dailyCounts[key]) dailyCounts[key].bookings++;
  }
  for (const r of responsesRes.data || []) {
    const key = toTWDate(r.created_at);
    if (dailyCounts[key]) dailyCounts[key].responses++;
  }

  // Convert to sorted array (oldest first)
  const trend = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, counts]) => ({ date, ...counts }));

  // Aggregated stats
  const requests = requestsRes.data || [];
  const bookings = bookingsRes.data || [];
  const reviews = reviewsRes.data || [];

  // Service popularity
  const serviceCounts: Record<string, number> = {};
  for (const r of requests) {
    for (const s of r.services || []) {
      serviceCounts[s] = (serviceCounts[s] || 0) + 1;
    }
  }
  const topServices = Object.entries(serviceCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Location popularity
  const locationCounts: Record<string, number> = {};
  for (const r of requests) {
    for (const l of r.locations || []) {
      // Extract city only (e.g., "台北市 大安區" → "台北市")
      const city = l.split(" ")[0];
      locationCounts[city] = (locationCounts[city] || 0) + 1;
    }
  }
  const topLocations = Object.entries(locationCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));

  // Budget distribution
  const budgetCounts: Record<string, number> = {};
  for (const r of requests) {
    if (r.budget_range) {
      budgetCounts[r.budget_range] = (budgetCounts[r.budget_range] || 0) + 1;
    }
  }

  // Revenue (completed bookings)
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const totalRevenue = completedBookings.reduce(
    (sum, b) => sum + (b.final_price || 0),
    0
  );
  const avgPrice =
    completedBookings.length > 0
      ? Math.round(totalRevenue / completedBookings.length)
      : 0;

  // Conversion funnel
  const funnel = {
    requests: requests.length,
    responses: (responsesRes.data || []).length,
    bookings: bookings.length,
    completed: completedBookings.length,
    reviews: reviews.length,
  };

  // Average rating
  const avgRating =
    reviews.length > 0
      ? Math.round(
          (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) * 10
        ) / 10
      : 0;

  // Request status breakdown
  const statusCounts: Record<string, number> = {};
  for (const r of requests) {
    statusCounts[r.status] = (statusCounts[r.status] || 0) + 1;
  }

  // --- Advanced Analytics ---

  // Step-by-step funnel conversion rates
  const funnelConversion = {
    requests_to_responses: funnel.requests > 0 ? Math.round((funnel.responses / funnel.requests) * 1000) / 10 : 0,
    responses_to_bookings: funnel.responses > 0 ? Math.round((funnel.bookings / funnel.responses) * 1000) / 10 : 0,
    bookings_to_completed: funnel.bookings > 0 ? Math.round((funnel.completed / funnel.bookings) * 1000) / 10 : 0,
    completed_to_reviews: funnel.completed > 0 ? Math.round((funnel.reviews / funnel.completed) * 1000) / 10 : 0,
  };

  // LTV estimate: total completed booking revenue / unique customers with completed bookings
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const { data: allCompletedBookings } = await supabase
    .from("bookings")
    .select("customer_id, final_price")
    .eq("status", "completed");

  const completedCustomerIds = new Set<string>();
  let ltvTotalRevenue = 0;
  for (const b of allCompletedBookings || []) {
    if (b.customer_id) completedCustomerIds.add(b.customer_id);
    ltvTotalRevenue += b.final_price || 0;
  }

  const ltv = {
    average_revenue_per_customer: completedCustomerIds.size > 0
      ? Math.round(ltvTotalRevenue / completedCustomerIds.size)
      : 0,
    total_revenue: ltvTotalRevenue,
    unique_customers: completedCustomerIds.size,
  };

  // Retention cohort data: last 6 months
  // For each month, find customers who made their first booking in that month (cohort),
  // then count how many returned the next month
  const retention: { month: string; cohort_size: number; returned: number; retention_pct: number }[] = [];

  const { data: allBookings } = await supabase
    .from("bookings")
    .select("customer_id, created_at")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at", { ascending: true });

  // Group bookings by customer -> list of months
  const customerBookingMonths: Record<string, Set<string>> = {};
  for (const b of allBookings || []) {
    if (!b.customer_id) continue;
    const month = new Date(b.created_at).toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" }).slice(0, 7);
    if (!customerBookingMonths[b.customer_id]) {
      customerBookingMonths[b.customer_id] = new Set();
    }
    customerBookingMonths[b.customer_id].add(month);
  }

  // Find first booking month for each customer (globally, not just last 6 months)
  const { data: firstBookings } = await supabase
    .from("bookings")
    .select("customer_id, created_at")
    .order("created_at", { ascending: true });

  const firstBookingMonth: Record<string, string> = {};
  for (const b of firstBookings || []) {
    if (!b.customer_id) continue;
    if (!firstBookingMonth[b.customer_id]) {
      firstBookingMonth[b.customer_id] = new Date(b.created_at)
        .toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" })
        .slice(0, 7);
    }
  }

  // Build cohort for each of the last 6 months
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    const monthKey = d.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" }).slice(0, 7);

    // Next month key
    const nextD = new Date(d);
    nextD.setMonth(nextD.getMonth() + 1);
    const nextMonthKey = nextD.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" }).slice(0, 7);

    // Cohort: customers whose first booking was in monthKey
    const cohortCustomers = Object.entries(firstBookingMonth)
      .filter(([, m]) => m === monthKey)
      .map(([cid]) => cid);

    // Returned: cohort customers who also booked in nextMonthKey
    const returned = cohortCustomers.filter(
      (cid) => customerBookingMonths[cid]?.has(nextMonthKey)
    ).length;

    retention.push({
      month: monthKey,
      cohort_size: cohortCustomers.length,
      returned,
      retention_pct: cohortCustomers.length > 0
        ? Math.round((returned / cohortCustomers.length) * 1000) / 10
        : 0,
    });
  }

  return NextResponse.json({
    trend,
    topServices,
    topLocations,
    budgetDistribution: budgetCounts,
    funnel,
    funnelConversion,
    revenue: { total: totalRevenue, average: avgPrice, count: completedBookings.length },
    avgRating,
    statusBreakdown: statusCounts,
    ltv,
    retention,
    period: { from: since.split("T")[0], to: now.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" }) },
  });
}
