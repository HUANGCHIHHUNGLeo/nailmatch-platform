import { createServiceClient } from "@/lib/supabase/server";
import { getLineUserId } from "@/lib/line/verify-token";

/**
 * Resolve the current customer from a request.
 * Requires valid LINE ID token in Authorization header.
 *
 * Returns { customerId, lineUserId } or null.
 */
export async function resolveCustomer(
  request: Request
): Promise<{ customerId: string; lineUserId: string | null } | null> {
  const supabase = await createServiceClient();

  const lineUserId = await getLineUserId(request);
  if (!lineUserId) return null;

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
