import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { notifyRequestExpired } from "@/lib/line/messaging";

// Vercel Cron calls this daily to expire stale requests
// Expiry logic: if the preferred date has passed, mark as expired
export async function GET(request: Request) {
  // Verify cron secret (Vercel sends this header)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createServiceClient();
  // Use Taiwan time (UTC+8) for date calculations
  const todayStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" }); // "2026-03-06"

  // Fetch all active requests (pending/matching) that might be expired
  const { data: requests, error } = await supabase
    .from("service_requests")
    .select(
      "id, customer_id, services, preferred_date, preferred_date_custom, created_at, status"
    )
    .in("status", ["pending", "matching"]);

  if (error) {
    console.error("Expire requests: fetch error", error);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  let expiredCount = 0;
  const notifications: Promise<unknown>[] = [];

  for (const req of requests || []) {
    const deadline = calculateDeadline(
      req.preferred_date,
      req.preferred_date_custom,
      req.created_at
    );

    if (!deadline || deadline >= todayStr) continue;

    // This request has expired — update status
    await supabase
      .from("service_requests")
      .update({ status: "expired" })
      .eq("id", req.id);
    expiredCount++;

    // Notify customer via LINE (non-blocking)
    const { data: customer } = await supabase
      .from("customers")
      .select("line_user_id")
      .eq("id", req.customer_id)
      .single();

    if (customer?.line_user_id) {
      notifications.push(
        notifyRequestExpired(customer.line_user_id, {
          services: req.services || [],
          preferredDate: req.preferred_date || "未指定",
          requestId: req.id,
        }).catch((err) =>
          console.error(`Failed to notify customer for ${req.id}:`, err)
        )
      );
    }
  }

  await Promise.allSettled(notifications);

  return NextResponse.json({
    ok: true,
    expired: expiredCount,
    checked: (requests || []).length,
  });
}

// Convert a Date to "YYYY-MM-DD" in Taiwan time (UTC+8)
function toTaiwanDateStr(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: "Asia/Taipei" });
}

// Add days to a date and return Taiwan date string
function addDaysTW(base: Date, days: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return toTaiwanDateStr(d);
}

// Calculate the deadline date string ("YYYY-MM-DD") after which the request expires
function calculateDeadline(
  preferredDate: string | null,
  preferredDateCustom: string | null,
  createdAt: string
): string | null {
  const created = new Date(createdAt);

  switch (preferredDate) {
    case "今天":
      // Expires the day after the request was created
      return addDaysTW(created, 1);
    case "明天":
      // Expires 2 days after creation
      return addDaysTW(created, 2);
    case "本週": {
      // Expires at end of the week (Sunday) + 1 day
      // Get day-of-week in Taiwan time
      const twDay = new Date(created.toLocaleString("en-US", { timeZone: "Asia/Taipei" })).getDay();
      const daysUntilSunday = 7 - twDay;
      return addDaysTW(created, daysUntilSunday + 1);
    }
    case "其他日期": {
      if (preferredDateCustom) {
        // Expires the day after the custom date
        const d = new Date(preferredDateCustom + "T00:00:00+08:00");
        return addDaysTW(d, 1);
      }
      // Fallback: 7 days after creation
      return addDaysTW(created, 7);
    }
    default:
      // No date specified — expire after 7 days
      return addDaysTW(created, 7);
  }
}
