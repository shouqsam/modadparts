"use client";

import { useState } from "react";

export default function ExcelImportForm({ onImported }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/import", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر استيراد الملف");
        return;
      }
      setResult(data);
      setFile(null);
      onImported();
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-panel">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="admin-panel-title">استيراد من إكسل</h2>
          <p className="admin-panel-sub max-w-2xl">
            الأعمدة: الاسم، رقم_القطعة، الماركة (يمكن عدة ماركات مفصولة بفاصلة)، الفئة، السعر، الكمية،
            رابط_الصورة، الوصف. الملف بصيغة .xlsx
          </p>
        </div>
        <a href="/api/admin/template" className="admin-btn-ghost whitespace-nowrap self-start">
          تحميل القالب
        </a>
      </div>

      <label className="admin-dropzone">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="sr-only"
        />
        <span className="admin-dropzone-title">{file ? file.name : "اسحب الملف هنا أو اختره"}</span>
        <span className="admin-dropzone-sub">
          {file ? "اضغط لتغيير الملف" : "يدعم ملفات Excel (.xlsx / .xls)"}
        </span>
      </label>

      {error && (
        <p className="mt-4 text-rose-700 text-sm bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">{error}</p>
      )}
      {result && (
        <div className="mt-4 text-sm rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 space-y-1">
          <p className="text-emerald-800 font-bold">تم استيراد {result.imported} منتج بنجاح.</p>
          {result.usedFallbackNameCount > 0 && (
            <p className="text-amber-800">
              {result.usedFallbackNameCount} صف كان ناقص الاسم؛ تم استيراده باسم مؤقت. يمكنك الضغط على «تعديل»
              لإكمال البيانات لاحقاً.
            </p>
          )}
          {result.skippedCount > 0 && (
            <p className="text-slate-600">
              تم تجاوز {result.skippedCount} صف فارغ تماماً
              {result.skippedRows?.length
                ? ` (أمثلة: ${result.skippedRows.slice(0, 10).join("، ")}${result.skippedCount > 10 ? "..." : ""})`
                : ""}
              .
            </p>
          )}
        </div>
      )}

      <div className="mt-5 pt-5 border-t border-slate-100">
        <button type="submit" disabled={!file || loading} className="admin-btn-primary disabled:opacity-50">
          {loading ? "جاري الاستيراد..." : "استيراد الملف"}
        </button>
      </div>
    </form>
  );
}
