"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SITE_SHORT_NAME } from "../../../lib/site";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر تسجيل الدخول");
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-shell min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-7">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt={SITE_SHORT_NAME}
            className="mx-auto h-14 w-14 rounded-2xl object-contain bg-white shadow-sm ring-1 ring-slate-200/80 p-1.5 mb-4"
          />
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">لوحة إدارة {SITE_SHORT_NAME}</h1>
          <p className="text-sm text-slate-500 mt-1.5">أدخل كلمة مرور الأدمن للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-panel !p-6 sm:!p-7">
          <label className="flex flex-col gap-1.5 text-sm font-semibold text-slate-700">
            كلمة المرور
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoFocus
              className="admin-input"
            />
          </label>

          {error && (
            <p className="mt-4 text-rose-700 text-sm text-center bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="admin-btn-primary w-full mt-5 disabled:opacity-50"
          >
            {loading ? "جاري الدخول..." : "دخول لوحة التحكم"}
          </button>

          <a href="/" className="block text-center text-sm text-slate-500 hover:text-brand font-semibold mt-4 transition-colors">
            العودة للمتجر
          </a>
        </form>
      </div>
    </div>
  );
}
