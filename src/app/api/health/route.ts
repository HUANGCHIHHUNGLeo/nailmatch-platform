import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const checks: Record<string, string> = {};

  // 1. Check env vars exist
  checks.SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
    ? `OK (${process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 30)}...)`
    : "MISSING";
  checks.SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ? `OK (${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 20)}...)`
    : "MISSING";
  checks.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? `OK (${process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 20)}...)`
    : "MISSING";

  // 2. Try Supabase connection
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("artists")
      .select("id")
      .limit(1);

    if (error) {
      checks.DB_CONNECTION = `ERROR: ${error.message}`;
    } else {
      checks.DB_CONNECTION = `OK (found ${data?.length || 0} rows)`;
    }
  } catch (e) {
    checks.DB_CONNECTION = `CRASH: ${e instanceof Error ? e.message : String(e)}`;
  }

  return NextResponse.json(checks);
}
