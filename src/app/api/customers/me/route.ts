import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { resolveCustomer } from "@/lib/auth/resolve-customer";

export async function DELETE(request: Request) {
  try {
    const resolved = await resolveCustomer(request);
    if (!resolved) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createServiceClient();
    const customerId = resolved.customerId;

    // 1. 刪除客戶的評價
    await supabase.from("reviews").delete().eq("customer_id", customerId);

    // 2. 將預約的 customer 設為 null（保留設計師的預約紀錄）
    await supabase.from("bookings").update({ customer_id: null }).eq("customer_id", customerId);

    // 3. 刪除需求的參考圖片（Storage）
    const { data: requests } = await supabase
      .from("service_requests")
      .select("id, reference_images")
      .eq("customer_id", customerId);

    if (requests?.length) {
      const allImages = requests.flatMap((r) => r.reference_images || []);
      const storagePaths = allImages
        .map((url: string) => {
          const match = url?.match(/\/storage\/v1\/object\/public\/([^?]+)/);
          return match ? match[1] : null;
        })
        .filter(Boolean) as string[];

      if (storagePaths.length > 0) {
        const byBucket = new Map<string, string[]>();
        for (const p of storagePaths) {
          const [bucket, ...rest] = p.split("/");
          const existing = byBucket.get(bucket) || [];
          existing.push(rest.join("/"));
          byBucket.set(bucket, existing);
        }
        for (const [bucket, paths] of byBucket) {
          await supabase.storage.from(bucket).remove(paths);
        }
      }

      // 4. 刪除需求的報價回應
      const requestIds = requests.map((r) => r.id);
      await supabase.from("artist_responses").delete().in("request_id", requestIds);

      // 5. 刪除需求本身
      await supabase.from("service_requests").delete().eq("customer_id", customerId);
    }

    // 6. 刪除客戶本身
    const { error } = await supabase.from("customers").delete().eq("id", customerId);

    if (error) {
      console.error("Customer delete error:", error);
      return NextResponse.json({ error: "刪除失敗" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "帳號已刪除" });
  } catch (error) {
    console.error("Customer DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
