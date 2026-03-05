import type { Metadata } from "next";
import { Noto_Sans_TC, Noto_Serif_TC } from "next/font/google";
import { GlobalNav } from "@/components/shared/GlobalNav";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const notoSerifTC = Noto_Serif_TC({
  variable: "--font-noto-serif-tc",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "NaLi Match | 美甲美睫媒合平台",
  description:
    "不用一間一間問！送出需求，讓符合條件的美甲/美睫師主動報價。看作品、看價格、選順眼的直接預約。",
  keywords: ["美甲", "美睫", "美甲預約", "美睫預約", "美甲師", "美睫師", "凝膠美甲", "美甲媒合"],
  openGraph: {
    title: "NaLi Match | 美甲美睫媒合平台",
    description: "送出需求，美甲/美睫師主動報價，透明比價一鍵預約",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant-TW" className="scroll-smooth">
      <body className={`${notoSansTC.variable} ${notoSerifTC.variable} font-sans antialiased bg-[var(--brand-bg)] text-slate-800 min-h-screen flex flex-col selection:bg-[var(--brand-light)] selection:text-[var(--brand-dark)]`}>
        {children}
        <GlobalNav />
      </body>
    </html>
  );
}
