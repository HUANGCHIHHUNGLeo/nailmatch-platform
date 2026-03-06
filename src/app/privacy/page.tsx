import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Link href="/" className="text-lg font-semibold text-[var(--brand)]">
            NaLi Match
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">隱私權政策</h1>
        <p className="mb-4 text-sm text-gray-500">最後更新日期：2025 年 3 月</p>

        <div className="space-y-6 text-sm leading-relaxed text-gray-700">
          {/* 個資法第8條告知事項 */}
          <section className="rounded-lg border-2 border-[var(--brand)] bg-[var(--brand-light)]/30 p-4">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              個人資料蒐集告知聲明
            </h2>
            <p className="mb-2 text-xs text-gray-500">
              依據中華民國《個人資料保護法》第 8 條規定，本平台於蒐集您的個人資料前，特此告知以下事項：
            </p>
            <ul className="ml-4 list-disc space-y-1 text-gray-700">
              <li><strong>蒐集機關</strong>：NaLi Match 平台營運團隊</li>
              <li><strong>蒐集目的</strong>：行銷業務（040）、消費者保護（090）、契約或類似契約之管理（069）、客戶管理（063）</li>
              <li><strong>個資類別</strong>：辨識個人者（C001 姓名、C002 聯絡方式）、社會活動（C011 個人描述、消費紀錄）</li>
              <li><strong>利用期間</strong>：帳號使用期間至停用後 2 年</li>
              <li><strong>利用地區</strong>：中華民國境內</li>
              <li><strong>利用對象</strong>：NaLi Match 平台及配對之設計師（僅限必要資料）</li>
              <li><strong>利用方式</strong>：以自動化系統進行配對、LINE 推播通知、資料庫儲存</li>
              <li><strong>當事人權利</strong>：您可依個資法第 3 條行使查詢、閱覽、製給複製本、補充或更正、停止蒐集處理利用、刪除等權利</li>
              <li><strong>不提供之影響</strong>：若您選擇不提供個人資料，本平台將無法提供完整的媒合服務</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">1. 資料蒐集項目</h2>
            <p>NaLi Match（以下簡稱「本平台」）依個人資料保護法蒐集以下個人資料：</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li><strong>LINE 帳號資訊</strong>：LINE User ID、顯示名稱、大頭貼（透過 LINE Login 授權取得）</li>
              <li><strong>聯絡資訊</strong>：姓名、電話號碼（選填）、Email（設計師）</li>
              <li><strong>服務需求資料</strong>：性別、偏好風格、預算範圍、服務地點、預約時間</li>
              <li><strong>參考圖片</strong>：您上傳的美甲/美睫參考圖片</li>
              <li><strong>設計師專業資料</strong>：服務項目、擅長風格、價格範圍、作品集照片、社群帳號</li>
              <li><strong>互動記錄</strong>：報價紀錄、預約紀錄、評價內容</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">2. 資料使用目的</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li><strong>配對服務</strong>：根據您的需求，為您媒合合適的美甲/美睫設計師</li>
              <li><strong>即時通知</strong>：透過 LINE 推播報價通知、預約確認、評價提醒等訊息</li>
              <li><strong>預約管理</strong>：建立、確認、取消預約等流程</li>
              <li><strong>服務改善</strong>：分析使用模式以優化平台體驗</li>
              <li><strong>客服支援</strong>：處理您的問題與回饋</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">3. 資料分享對象</h2>
            <p>您的個人資料僅在以下情況被分享：</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li><strong>配對的設計師</strong>：設計師僅能看到您的需求內容（服務項目、預算、風格偏好等），不會看到您的 LINE ID 或電話號碼</li>
              <li><strong>配對的客戶</strong>：客戶確認預約後，才能看到設計師的聯絡資訊</li>
              <li><strong>法律要求</strong>：依法律規定或司法機關要求時</li>
            </ul>
            <p className="mt-2">我們<strong>不會</strong>將您的資料出售給第三方。</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">4. 第三方服務</h2>
            <p>本平台使用以下第三方服務處理資料：</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li><strong>LINE Platform</strong>：用戶身份驗證、訊息推播</li>
              <li><strong>Supabase</strong>：資料庫儲存與管理（伺服器位於雲端）</li>
              <li><strong>Vercel</strong>：網站託管</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">5. 資料保存期間</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>帳號啟用期間：持續保存以提供服務</li>
              <li>帳號停用後：保留 2 年後自動刪除</li>
              <li>您可隨時要求提前刪除（見第 6 條）</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">6. 您的權利</h2>
            <p>您有權：</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li><strong>查閱</strong>：查看我們保存的您的個人資料</li>
              <li><strong>更正</strong>：修正不正確或過期的資料</li>
              <li><strong>刪除</strong>：要求刪除您的帳號及所有相關資料</li>
              <li><strong>撤回同意</strong>：隨時停止使用本平台服務</li>
            </ul>
            <p className="mt-2">
              如需行使上述權利，請透過 LINE 官方帳號（
              <strong>@778amvcd</strong>
              ）聯繫我們。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">7. 資料安全</h2>
            <p>
              我們採取合理的技術與管理措施保護您的個人資料，包括加密傳輸（HTTPS）、
              存取控制、定期安全檢查等。但請注意，沒有任何網路傳輸方式或儲存方法
              能保證 100% 安全。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">8. 政策更新</h2>
            <p>
              本隱私權政策可能不定期更新。重大變更時，我們會透過 LINE 推播通知您。
              繼續使用本平台即表示您同意更新後的政策。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">9. 聯絡我們</h2>
            <p>
              如有任何隱私相關問題，歡迎透過 LINE 官方帳號（
              <strong>@778amvcd</strong>）與我們聯繫。
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
