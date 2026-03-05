"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "登入失敗");
        return;
      }

      router.push("/admin");
    } catch {
      setError("連線失敗，請重試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900">NaLi Match</h1>
          <p className="mt-1 text-sm text-gray-500">管理員後台</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              管理密碼
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="請輸入管理密碼"
              className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-center text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full rounded-lg bg-pink-500 py-3 text-sm font-medium text-white transition hover:bg-pink-600 disabled:opacity-50"
          >
            {loading ? "驗證中..." : "登入"}
          </button>
        </form>
      </div>
    </div>
  );
}
