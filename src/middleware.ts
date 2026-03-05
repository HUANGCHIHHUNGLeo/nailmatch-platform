import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect /admin (but not /admin/login) — redirect to login if no session cookie
  if (pathname === "/admin" && !request.cookies.get("admin_session")) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     * - api/line/webhook (LINE webhook needs to be public)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/line/webhook).*)",
  ],
};
