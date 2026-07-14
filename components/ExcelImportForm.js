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
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h2 className="font-extrabold text-lg">استيراد منتجات من ملف إكسل</h2>
        <a href="/api/admin/template" className="text-brand text-sm font-bold hover:underline">
          تحميل قالب إكسل جاهز
        </a>
      </div>

      <p className="text-sm text-gray-500">
        الأعمدة: الاسم، رقم_القطعة، الماركة (يمكن عدة ماركات مفصولة بفاصلة مثل: نيسان، إنفينيتي)، الفئة (يمكن عدة
        فئات)، السعر، الكمية، رابط_الصورة، الوصف. الملف بصيغة .xlsx
      </p>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="text-sm"
      />

      {error && <p className="text-red-600 text-sm">{error}</p>}
      {result && (
        <div className="text-sm rounded-xl border border-green-100 bg-green-50 px-4 py-3 space-y-1">
          <p className="text-green-800 font-bold">تم استيراد {result.imported} منتج بنجاح.</p>
          {result.usedFallbackNameCount > 0 && (
            <p className="text-amber-700">
              {result.usedFallbackNameCount} صف كان ناقص الاسم؛ تم استيراده باسم مؤقت. يمكنك الضغط على «تعديل»
              لإكمال البيانات لاحقاً.
            </p>
          )}
          {result.skippedCount > 0 && (
            <p className="text-gray-600">
              تم تجاوز {result.skippedCount} صف فارغ تماماً
              {result.skippedRows?.length
                ? ` (أمثلة: ${result.skippedRows.slice(0, 10).join("، ")}${result.skippedCount > 10 ? "..." : ""})`
                : ""}
              .
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={!file || loading}
        className="bg-brand text-white font-bold py-2.5 px-6 rounded-xl disabled:opacity-50 w-fit"
      >
        {loading ? "جاري الاستيراد..." : "استيراد الملف"}
      </button>
    </form>
  );
}
