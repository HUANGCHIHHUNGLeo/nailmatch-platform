import Link from "next/link";

export default function TermsPage() {
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
        <h1 className="mb-6 text-2xl font-bold text-gray-900">服務條款</h1>
        <p className="mb-4 text-sm text-gray-500">最後更新日期：2025 年 3 月</p>

        <div className="space-y-6 text-sm leading-relaxed text-gray-700">
          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">1. 服務說明</h2>
            <p>
              NaLi Match（以下簡稱「本平台」）為美甲/美睫設計師與客戶之間的
              <strong>媒合平台</strong>，提供需求發佈、設計師配對、報價比較、
              預約管理等功能。
            </p>
            <p className="mt-2">
              本平台<strong>僅負責媒合服務</strong>，不直接提供美甲/美睫服務。
              實際服務由設計師獨立提供，服務品質由設計師負責。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">2. 使用資格</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>您必須年滿 18 歲方可使用本平台</li>
              <li>您必須提供真實、正確的個人資料</li>
              <li>設計師需通過平台審核後方可接單</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">3. 客戶使用規範</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>請如實填寫服務需求，勿發佈虛假需求</li>
              <li>確認預約後請準時赴約，如需取消請提前告知</li>
              <li>請尊重設計師的專業與時間</li>
              <li>服務完成後，歡迎留下真實的評價</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">4. 設計師使用規範</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>請提供真實的個人資料、作品照片與價格資訊</li>
              <li>報價應合理且透明，不得事後隨意加價</li>
              <li>確認預約後應準時提供服務</li>
              <li>請維持專業的服務品質與態度</li>
              <li>不得繞過平台私下聯繫客戶以規避平台機制</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">5. 禁止行為</h2>
            <p>使用本平台時，您不得：</p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>發佈虛假需求或不實資訊</li>
              <li>騷擾、威脅或歧視其他使用者</li>
              <li>利用平台進行與美甲/美睫無關的商業行為</li>
              <li>以技術手段干擾或破壞平台運作</li>
              <li>冒充他人或使用他人帳號</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">6. 費用與付款</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>客戶使用本平台完全免費</li>
              <li>服務費用由設計師報價，客戶與設計師之間直接結算</li>
              <li>本平台目前不收取設計師佣金或上架費</li>
              <li>付款方式依設計師提供的選項為準</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">7. 免責聲明</h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>本平台不保證配對成功或服務滿意度</li>
              <li>因設計師服務品質產生的糾紛，由客戶與設計師自行協調</li>
              <li>因不可抗力因素（如天災、系統故障）導致的服務中斷，本平台不承擔責任</li>
              <li>使用者應自行評估風險，選擇適合的設計師與服務</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">8. 智慧財產權</h2>
            <p>
              本平台的設計、程式碼、商標及內容均受智慧財產權保護。
              使用者上傳的作品與圖片，其著作權歸原作者所有，
              但授權本平台用於展示與媒合用途。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">9. 帳號終止</h2>
            <p>
              我們保留在以下情況終止或暫停您帳號的權利：
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>違反本服務條款</li>
              <li>收到多次負面評價或投訴</li>
              <li>長期未使用（超過 12 個月）</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">10. 條款修改</h2>
            <p>
              本服務條款可能不定期修改。重大變更時，我們會透過 LINE 推播通知您。
              繼續使用本平台即表示您同意修改後的條款。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">11. 管轄法律</h2>
            <p>
              本服務條款以<strong>中華民國法律</strong>為準據法。
              如有爭議，雙方同意以臺灣臺北地方法院為第一審管轄法院。
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">12. 聯絡我們</h2>
            <p>
              如有任何問題，歡迎透過 LINE 官方帳號（
              <strong>@778amvcd</strong>）與我們聯繫。
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
