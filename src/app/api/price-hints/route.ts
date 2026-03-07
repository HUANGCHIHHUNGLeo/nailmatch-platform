import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * 歷史成交價 API
 * 根據已完成預約的 final_price 和對應的 services，
 * 計算每個服務項目的成交價範圍
 */
export async function GET() {
  try {
    const supabase = await createServiceClient();

    // 取得所有已完成的預約 + 對應需求的服務項目
    const { data: bookings, error } = await supabase
      .from("bookings")
      .select("final_price, service_requests(services)")
      .eq("status", "completed")
      .not("final_price", "is", null);

    if (error) {
      console.error("Price hints fetch error:", error);
      return NextResponse.json({ data: [] });
    }

    // 每個服務項目收集所有成交價
    const priceMap: Record<string, number[]> = {};

    for (const booking of bookings || []) {
      const price = booking.final_price;
      if (!price || price <= 0) continue;

      const req = Array.isArray(booking.service_requests)
        ? booking.service_requests[0]
        : booking.service_requests;
      const services = (req as { services?: string[] })?.services || [];

      for (const service of services) {
        if (!priceMap[service]) priceMap[service] = [];
        priceMap[service].push(price);
      }
    }

    // 計算每個服務的價格範圍
    const hints = Object.entries(priceMap).map(([service, prices]) => ({
      service,
      min: Math.min(...prices),
      max: Math.max(...prices),
      avg: Math.round(prices.reduce((a, b) => a + b, 0) / prices.length),
      count: prices.length,
    }));

    return NextResponse.json(
      { data: hints },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" } }
    );
  } catch (error) {
    console.error("Price hints error:", error);
    return NextResponse.json({ data: [] });
  }
}
