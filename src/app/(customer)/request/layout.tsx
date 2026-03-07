import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "發佈需求 | NaLi Match 美甲美睫媒合",
  description: "30 秒送出你的美甲美睫需求，讓合適的設計師主動報價。免費使用，不收任何手續費。",
  openGraph: {
    title: "發佈美甲美睫需求 | NaLi Match",
    description: "30 秒送出需求，設計師主動報價",
  },
};

export default function RequestLayout({ children }: { children: React.ReactNode }) {
  return children;
}
