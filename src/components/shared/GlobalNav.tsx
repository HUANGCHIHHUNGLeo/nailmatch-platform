"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, LayoutDashboard } from "lucide-react";

export function GlobalNav() {
    const pathname = usePathname();

    // Hide on homepage since it already has all the navigation
    if (pathname === "/") return null;

    const isArtistSection = pathname.startsWith("/artist");

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
            {/* Artist dashboard link — show on artist pages but not on dashboard itself */}
            {isArtistSection && !pathname.startsWith("/artist/dashboard") && (
                <Link
                    href="/artist/dashboard"
                    className="flex h-12 items-center gap-2 rounded-full bg-[var(--brand-dark)] px-5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105"
                >
                    <LayoutDashboard className="h-4 w-4" />
                    設計師後台
                </Link>
            )}

            {/* 發佈需求 — show on non-artist, non-request pages */}
            {!isArtistSection && !pathname.startsWith("/request") && (
                <Link
                    href="/request"
                    className="flex h-12 items-center gap-2 rounded-full bg-[var(--brand)] px-5 text-sm font-medium text-white shadow-lg transition-transform hover:scale-105 hover:bg-[var(--brand-dark)]"
                >
                    <Sparkles className="h-4 w-4" />
                    發佈需求
                </Link>
            )}

            {/* 導回主頁 */}
            <Link
                href="/"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-[var(--brand-dark)] shadow-xl transition-transform hover:scale-105 hover:bg-slate-50 border border-slate-100"
                title="回主頁"
            >
                <Home className="h-5 w-5" />
            </Link>
        </div>
    );
}
