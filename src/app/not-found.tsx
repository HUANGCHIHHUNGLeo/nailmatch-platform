import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--brand-bg)] p-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-light)]">
          <span className="text-4xl font-bold text-[var(--brand)]">404</span>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">找不到頁面</h1>
        <p className="mb-6 text-sm text-gray-500">
          您要找的頁面不存在或已被移動。
        </p>
        <div className="space-y-3">
          <Button asChild className="w-full bg-[var(--brand)] hover:bg-[var(--brand-dark)]">
            <Link href="/">回首頁</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/request">發佈需求</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
