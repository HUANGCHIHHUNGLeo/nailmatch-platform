"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  LayoutDashboard,
  Menu,
  X,
  User,
  Image as ImageIcon,
  Calendar,
  Settings,
  Clock,
  Users,
  FileText,
  Shield,
  BarChart3,
  LogIn,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  description?: string;
}

const CUSTOMER_NAV: NavItem[] = [
  { href: "/", label: "首頁", icon: <Home className="h-5 w-5" /> },
  { href: "/request", label: "發佈需求", icon: <Sparkles className="h-5 w-5" />, description: "找設計師為您服務" },
  { href: "/artists", label: "設計師總覽", icon: <Users className="h-5 w-5" />, description: "瀏覽各地區設計師" },
  { href: "/my", label: "我的帳號", icon: <Calendar className="h-5 w-5" />, description: "需求紀錄・預約管理" },
];

const ARTIST_NAV: NavItem[] = [
  { href: "/artist/dashboard", label: "接案總覽", icon: <LayoutDashboard className="h-5 w-5" />, description: "查看新需求與報價" },
  { href: "/artist/portfolio", label: "作品管理", icon: <ImageIcon className="h-5 w-5" />, description: "上傳與管理作品集" },
  { href: "/artist/profile", label: "個人資料", icon: <User className="h-5 w-5" />, description: "編輯公開檔案" },
  { href: "/artist/bookings", label: "預約管理", icon: <Calendar className="h-5 w-5" />, description: "管理已確認的預約" },
  { href: "/artist/availability", label: "時段管理", icon: <Clock className="h-5 w-5" />, description: "設定可接案時段" },
  { href: "/artist/report", label: "業績報表", icon: <BarChart3 className="h-5 w-5" />, description: "收入統計與紀錄" },
  { href: "/artist/settings", label: "帳號設定", icon: <Settings className="h-5 w-5" />, description: "暫停接案、偏好設定" },
];

const FOOTER_NAV: NavItem[] = [
  { href: "/terms", label: "服務條款", icon: <FileText className="h-5 w-5" /> },
  { href: "/privacy", label: "隱私權政策", icon: <Shield className="h-5 w-5" /> },
];

export function GlobalNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Hide on admin pages and LIFF registration forms (artist-form only)
  if (pathname.startsWith("/admin") || pathname === "/line/liff/artist-form") return null;

  const isArtistSection = pathname.startsWith("/artist");

  return (
    <>
      {/* Hamburger button — fixed bottom-right */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="fixed bottom-6 right-6 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand)] text-white shadow-xl transition-transform hover:scale-105 hover:bg-[var(--brand-dark)] active:scale-95"
            aria-label="選單"
          >
            <Menu className="h-6 w-6" />
          </button>
        </SheetTrigger>

        <SheetContent side="right" className="w-80 p-0 overflow-y-auto [&>button]:hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-[var(--brand-bg)] px-5 py-4">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="text-lg font-bold text-[var(--brand)]"
            >
              NaLi Match
            </Link>
            <button
              onClick={() => setOpen(false)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {isArtistSection ? (
            <>
              {/* Artist Section: show artist nav as primary */}
              <nav className="px-3 py-3">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  設計師後台
                </p>
                {ARTIST_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        isActive
                          ? "bg-[var(--brand-light)] text-[var(--brand-darker)]"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className={isActive ? "text-[var(--brand)]" : "text-gray-400"}>
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${isActive ? "text-[var(--brand-darker)]" : ""}`}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="truncate text-xs text-gray-400">{item.description}</p>
                        )}
                      </div>
                      {isActive && (
                        <div className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-5"><Separator /></div>

              {/* Secondary: customer quick links */}
              <nav className="px-3 py-3">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  客戶功能
                </p>
                {CUSTOMER_NAV.slice(0, 3).map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                  >
                    <span className="text-gray-300">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </nav>
            </>
          ) : (
            <>
              {/* Customer Section: show customer nav as primary */}
              <nav className="px-3 py-3">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  找設計師
                </p>
                {CUSTOMER_NAV.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition-colors ${
                        isActive
                          ? "bg-[var(--brand-light)] text-[var(--brand-darker)]"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className={isActive ? "text-[var(--brand)]" : "text-gray-400"}>
                        {item.icon}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-medium ${isActive ? "text-[var(--brand-darker)]" : ""}`}>
                          {item.label}
                        </p>
                        {item.description && (
                          <p className="truncate text-xs text-gray-400">{item.description}</p>
                        )}
                      </div>
                      {isActive && (
                        <div className="h-2 w-2 rounded-full bg-[var(--brand)]" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="px-5"><Separator /></div>

              {/* Secondary: single entry point for artists, not full backend links */}
              <nav className="px-3 py-3">
                <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  設計師專區
                </p>
                <Link
                  href="/artist"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
                >
                  <span className="text-gray-300"><LogIn className="h-5 w-5" /></span>
                  <div>
                    <span className="text-sm">設計師登入 / 註冊</span>
                    <p className="text-xs text-gray-400">已有帳號？點此進入後台</p>
                  </div>
                </Link>
              </nav>
            </>
          )}

          <div className="px-5"><Separator /></div>

          {/* Footer Nav */}
          <nav className="px-3 py-3">
            {FOOTER_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-gray-400 transition-colors hover:bg-gray-50 hover:text-gray-600"
              >
                <span className="text-gray-300">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom branding */}
          <div className="mt-auto border-t bg-[var(--brand-bg)] px-5 py-4">
            <p className="text-center text-xs text-gray-400">
              NaLi Match — 美甲美睫媒合平台
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
