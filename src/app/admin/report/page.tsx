"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Stats {
  artists: { total: number; pending: number; verified: number };
  customers: { total: number };
  requests: { total: number; pending: number; matching: number };
  bookings: { total: number; confirmed: number; completed: number };
}

export default function AdminReportPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        setStats(await res.json());
      } catch {
        console.error("Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--brand)] border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Screen-only header */}
      <header className="border-b print:hidden">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700">
              ← 回管理首頁
            </Link>
            <h1 className="text-lg font-bold text-gray-900">MVP 報告</h1>
          </div>
          <Button onClick={() => window.print()} size="sm">
            列印 / 輸出 PDF
          </Button>
        </div>
      </header>

      {/* Report Content */}
      <main className="mx-auto max-w-4xl px-8 py-10 print:max-w-none print:px-12 print:py-8">
        {/* Cover */}
        <div className="mb-12 text-center print:mb-8">
          <p className="mb-2 text-sm tracking-widest text-gray-400">MVP PRODUCT REPORT</p>
          <h1 className="mb-3 text-4xl font-bold text-[var(--brand)] print:text-3xl">
            NaLi Match
          </h1>
          <p className="text-lg text-gray-600">美甲美睫智慧媒合平台</p>
          <p className="mt-4 text-sm text-gray-400">
            報告日期：{new Date().toLocaleDateString("zh-TW", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>

        {/* 1. Product Overview */}
        <Section number="1" title="產品概述">
          <p>
            NaLi Match 是一個專為台灣市場設計的美甲/美睫媒合平台。透過 LINE 官方帳號
            作為入口，讓客戶只需幾步就能找到合適的設計師，同時讓設計師能高效地接觸到潛在客戶。
          </p>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4 print:grid-cols-4">
            <MetricCard label="目標用戶" value="美甲美睫消費者" />
            <MetricCard label="服務範圍" value="全台灣" />
            <MetricCard label="主要通路" value="LINE OA" />
            <MetricCard label="商業模式" value="免費媒合" />
          </div>
        </Section>

        {/* 2. Core Features */}
        <Section number="2" title="核心功能">
          <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
            <FeatureCard
              title="客戶需求發佈"
              items={[
                "多步驟引導式表單（地點→服務→預算→風格→備註）",
                "支援圖片上傳（參考設計）",
                "LINE LIFF 整合，自動綁定身份",
                "聯絡資訊收集 + 同意條款",
              ]}
            />
            <FeatureCard
              title="設計師配對系統"
              items={[
                "依地區、服務項目、預算自動配對",
                "LINE 即時推播通知設計師有新需求",
                "設計師可查看需求細節並報價",
                "支援美甲師 + 美睫師兩種角色",
              ]}
            />
            <FeatureCard
              title="報價與預約"
              items={[
                "設計師線上報價，客戶收到 LINE 通知",
                "Flex Message 卡片式報價展示",
                "一鍵確認預約，自動通知雙方",
                "預約完成後推播評價提醒",
              ]}
            />
            <FeatureCard
              title="管理後台"
              items={[
                "設計師審核（通過/拒絕）",
                "全平台數據統計",
                "客戶/需求/預約明細表格",
                "轉換率等關鍵指標",
              ]}
            />
          </div>
        </Section>

        {/* 3. Tech Stack */}
        <Section number="3" title="技術架構">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500">
                  <th className="pb-2 pr-4 font-medium">層級</th>
                  <th className="pb-2 pr-4 font-medium">技術</th>
                  <th className="pb-2 font-medium">說明</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <TechRow layer="前端框架" tech="Next.js 15 (App Router)" desc="React 伺服器端渲染 + 靜態生成" />
                <TechRow layer="UI 元件" tech="shadcn/ui + Tailwind CSS" desc="一致化設計系統" />
                <TechRow layer="後端 API" tech="Next.js Route Handlers" desc="RESTful API 端點" />
                <TechRow layer="資料庫" tech="Supabase (PostgreSQL)" desc="即時資料庫 + 儲存空間" />
                <TechRow layer="用戶系統" tech="LINE Login (LIFF SDK)" desc="免註冊，用 LINE 帳號登入" />
                <TechRow layer="訊息推播" tech="LINE Messaging API" desc="Flex Message 即時通知" />
                <TechRow layer="圖片儲存" tech="Supabase Storage" desc="作品集 + 參考圖片" />
                <TechRow layer="部署" tech="Vercel" desc="自動 CI/CD，全球 CDN" />
                <TechRow layer="表單驗證" tech="Zod + React Hook Form" desc="型別安全的表單驗證" />
              </tbody>
            </table>
          </div>
        </Section>

        {/* 4. Platform Data */}
        {stats && (
          <Section number="4" title="平台數據">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 print:grid-cols-4">
              <StatCard label="設計師總數" value={stats.artists.total} sub={`${stats.artists.verified} 已驗證`} />
              <StatCard label="客戶總數" value={stats.customers.total} />
              <StatCard label="需求總數" value={stats.requests.total} sub={`${stats.requests.matching} 配對中`} />
              <StatCard label="預約總數" value={stats.bookings.total} sub={`${stats.bookings.completed} 已完成`} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 print:grid-cols-3">
              <StatCard
                label="需求→預約轉換率"
                value={`${stats.requests.total > 0 ? Math.round((stats.bookings.total / stats.requests.total) * 100) : 0}%`}
              />
              <StatCard label="待審核設計師" value={stats.artists.pending} />
              <StatCard label="已確認預約" value={stats.bookings.confirmed} />
            </div>
          </Section>
        )}

        {/* 5. User Flow */}
        <Section number="5" title="使用者流程">
          <div className="space-y-6">
            <FlowSection
              title="客戶端流程"
              steps={[
                "加入 LINE 官方帳號 @778amvcd",
                "點選「我要預約」→ 開啟 LIFF 表單",
                "LINE Login 自動授權身份",
                "填寫需求（地點→服務→預算→風格→備註→聯絡→同意條款）",
                "送出需求，系統自動配對設計師",
                "收到設計師報價 LINE 推播（Flex Message）",
                "選擇設計師，確認預約",
                "服務完成後收到評價提醒",
              ]}
            />
            <FlowSection
              title="設計師端流程"
              steps={[
                "加入 LINE 官方帳號並填寫註冊表單",
                "等待管理員審核通過",
                "收到新需求 LINE 推播通知",
                "查看需求細節並報價",
                "客戶確認後收到預約通知",
                "提供服務，更新預約狀態",
              ]}
            />
          </div>
        </Section>

        {/* 6. Revenue Model */}
        <Section number="6" title="商業模式與獲利分析">
          <p className="mb-4">
            NaLi Match 目前處於 MVP 免費階段，以快速累積用戶為優先。以下為平台三階段獲利策略：
          </p>

          <div className="mb-6 space-y-4">
            <RevenueCard
              phase="Phase 1：免費媒合期（現階段）"
              timeline="0-6 個月"
              model="完全免費"
              description="客戶免費發需求，設計師免費接單。目標：累積設計師資源與客戶口碑，驗證產品市場適配性（PMF）。"
              revenue="NT$0"
              goal="建立雙邊網路效應，達到 50+ 設計師、500+ 客戶"
            />
            <RevenueCard
              phase="Phase 2：佣金模式"
              timeline="6-12 個月"
              model="成交抽成 10-15%"
              description="每筆成功預約，平台從設計師端收取 10-15% 服務費。平均客單價 NT$1,500，平台抽成 NT$150-225/單。透過 LINE Pay / 綠界金流整合自動扣款。"
              revenue="月營收預估：100 筆/月 × NT$180 = NT$18,000"
              goal="達到月均 100+ 成交訂單"
            />
            <RevenueCard
              phase="Phase 3：多元營收"
              timeline="12-24 個月"
              model="佣金 + 訂閱 + 廣告"
              description="設計師付費訂閱（月費 NT$299-599）可享置頂曝光、優先推薦、數據分析報表等進階功能。客戶端維持免費，搭配美甲/美睫品牌廣告合作。"
              revenue="月營收預估：佣金 NT$50,000 + 訂閱 NT$30,000 + 廣告 NT$20,000 = NT$100,000"
              goal="月營收突破 NT$100,000，開始獲利"
            />
          </div>

          <div className="rounded-lg border bg-gray-50 p-4">
            <h3 className="mb-2 font-semibold text-gray-900">單位經濟分析</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-xs text-gray-500">
                    <th className="pb-2 pr-4 font-medium">指標</th>
                    <th className="pb-2 pr-4 font-medium">數值</th>
                    <th className="pb-2 font-medium">說明</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  <tr className="border-b"><td className="py-2 pr-4 font-medium">平均客單價 (AOV)</td><td className="py-2 pr-4">NT$1,500</td><td className="py-2 text-gray-500">美甲 NT$800-2,500，美睫 NT$1,000-3,000</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-medium">平台佣金率</td><td className="py-2 pr-4">10-15%</td><td className="py-2 text-gray-500">每筆成交抽 NT$150-225</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-medium">客戶獲取成本 (CAC)</td><td className="py-2 pr-4">NT$50-100</td><td className="py-2 text-gray-500">LINE OA 好友邀請 + 口碑推薦</td></tr>
                  <tr className="border-b"><td className="py-2 pr-4 font-medium">客戶終身價值 (LTV)</td><td className="py-2 pr-4">NT$900-1,350</td><td className="py-2 text-gray-500">年均 6 次消費 × NT$150-225 佣金</td></tr>
                  <tr><td className="py-2 pr-4 font-medium">LTV / CAC 比率</td><td className="py-2 pr-4 font-semibold text-green-600">9-27x</td><td className="py-2 text-gray-500">健康標準 &gt;3x ✓</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </Section>

        {/* 7. Growth Targets */}
        <Section number="7" title="成長目標與里程碑">
          <div className="mb-6 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-xs text-gray-500">
                  <th className="pb-2 pr-4 font-medium">指標</th>
                  <th className="pb-2 pr-4 font-medium text-center">Month 1</th>
                  <th className="pb-2 pr-4 font-medium text-center">Month 3</th>
                  <th className="pb-2 pr-4 font-medium text-center">Month 6</th>
                  <th className="pb-2 pr-4 font-medium text-center">Month 12</th>
                  <th className="pb-2 font-medium text-center">Month 24</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="py-2.5 pr-4 font-medium">LINE 好友數</td>
                  <td className="py-2.5 pr-4 text-center">100</td>
                  <td className="py-2.5 pr-4 text-center">500</td>
                  <td className="py-2.5 pr-4 text-center">2,000</td>
                  <td className="py-2.5 pr-4 text-center">8,000</td>
                  <td className="py-2.5 text-center">30,000</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4 font-medium">活躍設計師</td>
                  <td className="py-2.5 pr-4 text-center">10</td>
                  <td className="py-2.5 pr-4 text-center">30</td>
                  <td className="py-2.5 pr-4 text-center">80</td>
                  <td className="py-2.5 pr-4 text-center">200</td>
                  <td className="py-2.5 text-center">500</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4 font-medium">月需求數</td>
                  <td className="py-2.5 pr-4 text-center">20</td>
                  <td className="py-2.5 pr-4 text-center">80</td>
                  <td className="py-2.5 pr-4 text-center">300</td>
                  <td className="py-2.5 pr-4 text-center">800</td>
                  <td className="py-2.5 text-center">2,000</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4 font-medium">月成交預約</td>
                  <td className="py-2.5 pr-4 text-center">5</td>
                  <td className="py-2.5 pr-4 text-center">25</td>
                  <td className="py-2.5 pr-4 text-center">100</td>
                  <td className="py-2.5 pr-4 text-center">300</td>
                  <td className="py-2.5 text-center">800</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2.5 pr-4 font-medium">轉換率目標</td>
                  <td className="py-2.5 pr-4 text-center">25%</td>
                  <td className="py-2.5 pr-4 text-center">30%</td>
                  <td className="py-2.5 pr-4 text-center">33%</td>
                  <td className="py-2.5 pr-4 text-center">38%</td>
                  <td className="py-2.5 text-center">40%</td>
                </tr>
                <tr>
                  <td className="py-2.5 pr-4 font-medium text-[var(--brand)]">月營收預估</td>
                  <td className="py-2.5 pr-4 text-center">-</td>
                  <td className="py-2.5 pr-4 text-center">-</td>
                  <td className="py-2.5 pr-4 text-center font-semibold text-[var(--brand)]">NT$18K</td>
                  <td className="py-2.5 pr-4 text-center font-semibold text-[var(--brand)]">NT$54K</td>
                  <td className="py-2.5 text-center font-semibold text-[var(--brand)]">NT$174K</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold text-gray-900">成長策略</h3>
              <ul className="ml-4 list-disc space-y-1.5 text-xs text-gray-600">
                <li><strong>設計師端</strong>：與美甲美睫材料商合作推廣、美業 FB 社團招募、學院/補習班合作</li>
                <li><strong>客戶端</strong>：LINE 好友邀請獎勵、IG/小紅書 KOL 合作、Google 在地商家 SEO</li>
                <li><strong>留存提升</strong>：每月推播優惠、季節性活動（婚禮季、年節）、VIP 回客優惠</li>
                <li><strong>口碑裂變</strong>：分享邀請碼送折扣、評價排行榜、設計師推薦獎金</li>
              </ul>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold text-gray-900">關鍵里程碑</h3>
              <ul className="ml-4 list-disc space-y-1.5 text-xs text-gray-600">
                <li><strong>M1</strong>：首 10 位設計師完成註冊 + 首筆成功預約</li>
                <li><strong>M3</strong>：LINE 好友 500、月需求 80+、轉換率 30%+</li>
                <li><strong>M6</strong>：開啟佣金模式、整合線上支付、月營收 NT$18K</li>
                <li><strong>M12</strong>：200+ 活躍設計師、推出訂閱方案、月營收 NT$54K</li>
                <li><strong>M18</strong>：擴展至全台主要城市、品牌廣告合作</li>
                <li><strong>M24</strong>：月營收 NT$174K、評估 A 輪融資或持續自營獲利</li>
              </ul>
            </div>
          </div>
        </Section>

        {/* 8. Privacy & Compliance */}
        <Section number="8" title="隱私與法遵">
          <ul className="ml-4 list-disc space-y-2 text-gray-700">
            <li>完整隱私權政策頁面（/privacy）——涵蓋個資法第 8 條告知義務</li>
            <li>服務條款頁面（/terms）——明訂平台責任與使用規範</li>
            <li>個資蒐集同意機制——客戶送出需求前必須勾選同意</li>
            <li>設計師註冊同意機制——註冊表單內含同意條款 checkbox</li>
            <li>API 權限控管——客戶身份驗證、PII 保護（不外洩 LINE ID）</li>
            <li>管理後台身份驗證——Cookie + HMAC 驗證</li>
            <li>資料最小化——設計師僅能看到需求內容，不能看到客戶 LINE ID</li>
          </ul>
        </Section>

        {/* 9. Roadmap */}
        <Section number="9" title="後續發展方向">
          <div className="grid gap-4 sm:grid-cols-2 print:grid-cols-2">
            <RoadmapCard
              phase="短期 (1-2 個月)"
              items={[
                "客戶評價系統",
                "設計師作品集瀏覽",
                "預約日曆管理",
                "推播訊息模板優化",
              ]}
            />
            <RoadmapCard
              phase="中期 (3-6 個月)"
              items={[
                "線上支付整合（綠界/LINE Pay）",
                "設計師排行榜 / 推薦演算法",
                "客戶 CRM / 回客分析",
                "多語系支援",
              ]}
            />
          </div>
        </Section>

        {/* Footer */}
        <div className="mt-12 border-t pt-6 text-center text-xs text-gray-400 print:mt-8">
          <p>NaLi Match — 美甲美睫智慧媒合平台</p>
          <p className="mt-1">© {new Date().getFullYear()} NaLi Match. All rights reserved.</p>
        </div>
      </main>
    </div>
  );
}

/* --- Sub-components --- */

function Section({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10 print:mb-6 print:break-inside-avoid">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-xs font-bold text-white print:bg-gray-800">
          {number}
        </span>
        {title}
      </h2>
      <div className="text-sm leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
    </div>
  );
}

function FeatureCard({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
      <ul className="ml-4 list-disc space-y-1 text-xs text-gray-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function TechRow({ layer, tech, desc }: { layer: string; tech: string; desc: string }) {
  return (
    <tr className="border-b last:border-0">
      <td className="py-2 pr-4 font-medium text-gray-900">{layer}</td>
      <td className="py-2 pr-4 font-mono text-xs text-[var(--brand-dark)]">{tech}</td>
      <td className="py-2 text-gray-500">{desc}</td>
    </tr>
  );
}

function StatCard({ label, value, sub }: { label: string; value: number | string; sub?: string }) {
  return (
    <div className="rounded-lg border p-4 text-center">
      <p className="text-2xl font-bold text-[var(--brand)]">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
      {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

function FlowSection({ title, steps }: { title: string; steps: string[] }) {
  return (
    <div>
      <h3 className="mb-2 font-semibold text-gray-900">{title}</h3>
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--brand-light)] text-xs font-bold text-[var(--brand-dark)]">
              {i + 1}
            </span>
            <p className="text-sm text-gray-700 pt-0.5">{step}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RoadmapCard({ phase, items }: { phase: string; items: string[] }) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="mb-2 font-semibold text-gray-900">{phase}</h3>
      <ul className="ml-4 list-disc space-y-1 text-xs text-gray-600">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function RevenueCard({ phase, timeline, model, description, revenue, goal }: {
  phase: string; timeline: string; model: string; description: string; revenue: string; goal: string;
}) {
  return (
    <div className="rounded-lg border p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900">{phase}</h3>
        <span className="rounded-full bg-[var(--brand-light)] px-2 py-0.5 text-xs font-medium text-[var(--brand-dark)]">{timeline}</span>
      </div>
      <p className="mb-2 text-xs text-gray-500">收費模式：<strong className="text-gray-700">{model}</strong></p>
      <p className="mb-3 text-xs text-gray-600">{description}</p>
      <div className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
        <span className="text-xs text-gray-500">營收預估</span>
        <span className="text-sm font-semibold text-[var(--brand)]">{revenue}</span>
      </div>
      <p className="mt-2 text-xs text-gray-400">目標：{goal}</p>
    </div>
  );
}
