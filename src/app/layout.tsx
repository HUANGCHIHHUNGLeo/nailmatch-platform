import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  variable: "--font-noto-sans-tc",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
      <body className={`${notoSansTC.variable} font-sans antialiased bg-slate-50 text-slate-900 min-h-screen flex flex-col selection:bg-pink-200 selection:text-pink-900`}>
        {children}
      </body>
    </html>
  );
}
