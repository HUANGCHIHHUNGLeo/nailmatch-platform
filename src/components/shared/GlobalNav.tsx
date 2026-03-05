"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles } from "lucide-react";

export function GlobalNav() {
    const pathname = usePathname();

    // Hide on homepage since it already has all the navigation
    if (pathname === "/") return null;

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end gap-3">
            {/* 找美甲師/美睫師 - Only show if not already on the request page */}
            {!pathname.startsWith("/request") && (
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
