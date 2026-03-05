import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { verifyAdminSession } from "@/lib/admin/auth";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();

  const [artists, customers, requests, bookings] = await Promise.all([
    supabase.from("artists").select("id, is_verified, is_active", { count: "exact" }),
    supabase.from("customers").select("id", { count: "exact" }),
    supabase.from("service_requests").select("id, status", { count: "exact" }),
    supabase.from("bookings").select("id, status", { count: "exact" }),
  ]);

  const artistData = artists.data || [];
  const requestData = requests.data || [];
  const bookingData = bookings.data || [];

  return NextResponse.json({
    artists: {
      total: artists.count || 0,
      pending: artistData.filter((a) => !a.is_verified && a.is_active).length,
      verified: artistData.filter((a) => a.is_verified).length,
    },
    customers: {
      total: customers.count || 0,
    },
    requests: {
      total: requests.count || 0,
      pending: requestData.filter((r) => r.status === "pending").length,
      matching: requestData.filter((r) => r.status === "matching").length,
    },
    bookings: {
      total: bookings.count || 0,
      confirmed: bookingData.filter((b) => b.status === "confirmed").length,
      completed: bookingData.filter((b) => b.status === "completed").length,
    },
  });
}
