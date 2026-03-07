import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "配對大廳 | NaLi Match 美甲美睫媒合",
  description: "查看所有待配對的美甲美睫需求，為客戶提供報價。即時瀏覽最新需求，把握每個服務機會。",
  openGraph: {
    title: "配對大廳 | NaLi Match",
    description: "瀏覽待配對美甲美睫需求，即時報價",
  },
};

export default function LobbyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
