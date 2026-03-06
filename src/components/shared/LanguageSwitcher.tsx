"use client";

import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { lang, toggle } = useLanguage();

    return (
        <button
            onClick={toggle}
            title={lang === "zh" ? "Switch to English" : "切換中文"}
            className="group flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-slate-100 transition-all hover:scale-105 hover:shadow-2xl hover:ring-[var(--brand-light)] focus:outline-none"
            aria-label="Toggle language"
        >
            {/* Globe icon + language label */}
            <div className="flex flex-col items-center leading-none">
                <Globe className="h-4 w-4 text-[var(--brand)]" />
                <span
                    className="mt-0.5 text-[9px] font-bold uppercase tracking-wide text-[var(--brand-darker)]"
                    style={{ fontFamily: "var(--font-noto-sans-tc), sans-serif" }}
                >
                    {lang === "zh" ? "EN" : "中"}
                </span>
            </div>
        </button>
    );
}
