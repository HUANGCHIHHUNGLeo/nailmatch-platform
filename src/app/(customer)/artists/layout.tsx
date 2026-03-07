import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "設計師總覽 | NaLi Match 美甲美睫媒合",
  description: "瀏覽所有經過驗證的美甲師、美睫師，查看作品集、價格範圍、評價。找到最適合你的設計師！",
  openGraph: {
    title: "設計師總覽 | NaLi Match",
    description: "瀏覽驗證美甲美睫師，查看作品集與評價",
  },
};

export default function ArtistsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
