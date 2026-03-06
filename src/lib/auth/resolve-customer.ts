import { createServiceClient } from "@/lib/supabase/server";
import { getLineUserId } from "@/lib/line/verify-token";

/**
 * Resolve the current customer from a request.
 * 1. Try LINE ID token from Authorization header
 * 2. Dev fallback: return first customer (only in development)
 *
 * Returns { customerId, lineUserId } or null.
 */
export async function resolveCustomer(
  request: Request
): Promise<{ customerId: string; lineUserId: string | null } | null> {
  const supabase = await createServiceClient();

  // 1. Try LINE token auth
  const lineUserId = getLineUserId(request);
  if (lineUserId) {
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("line_user_id", lineUserId)
      .single();

    if (customer) {
      return { customerId: customer.id, lineUserId };
    }
    return null;
  }

  // 2. Dev fallback only
  if (process.env.NODE_ENV === "development") {
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .limit(1)
      .single();

    if (customer) {
      return { customerId: customer.id, lineUserId: null };
    }
  }

  return null;
}
