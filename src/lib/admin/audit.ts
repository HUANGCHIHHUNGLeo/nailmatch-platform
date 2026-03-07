import { createServiceClient } from "@/lib/supabase/server";

interface AuditEntry {
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ip?: string;
}

export async function logAdminAction({ action, entityType, entityId, details, ip }: AuditEntry) {
  try {
    const supabase = await createServiceClient();
    await supabase.from("audit_logs").insert({
      action,
      entity_type: entityType || null,
      entity_id: entityId || null,
      details: details || {},
      ip_address: ip || null,
    });
  } catch (err) {
    // Never let audit logging break the actual operation
    console.error("Audit log failed:", err);
  }
}
