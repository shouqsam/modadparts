"use client";

import { useState } from "react";
import { formatList, getProductBrands } from "../lib/productFields";

export default function AdminProductTable({ products, onEdit, onDeleted, onUpdated }) {
  const [deletingId, setDeletingId] = useState(null);
  const [ratingsProduct, setRatingsProduct] = useState(null);
  const [deletingRatingId, setDeletingRatingId] = useState(null);
  const [error, setError] = useState("");

  async function handleDelete(product) {
    if (!confirm(`هل تريد حذف "${product.name}"؟`)) return;
    setDeletingId(product.id);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
      if (res.ok) onDeleted(product.id);
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDeleteRating(productId, ratingId) {
    if (!confirm("هل تريد حذف هذا التقييم؟")) return;
    setDeletingRatingId(ratingId);
    setError("");
    try {
      const res = await fetch(`/api/admin/products/${productId}/ratings/${ratingId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر حذف التقييم");
        return;
      }
      onUpdated?.(data.product);
      setRatingsProduct(data.product);
    } catch {
      setError("حدث خطأ أثناء حذف التقييم");
    } finally {
      setDeletingRatingId(null);
    }
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-14 px-4">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
          <BoxIcon />
        </div>
        <p className="text-slate-600 font-semibold">لا توجد منتجات مطابقة</p>
        <p className="text-slate-400 text-sm mt-1">أضف منتجاً جديداً أو غيّر عبارة البحث.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-rose-700 text-sm bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-sm text-right min-w-[820px]">
          <thead>
            <tr className="bg-slate-50/90 text-slate-500 text-xs uppercase tracking-wide">
              <th className="p-3 font-bold normal-case tracking-normal">الصورة</th>
              <th className="p-3 font-bold normal-case tracking-normal">المنتج</th>
              <th className="p-3 font-bold normal-case tracking-normal">رقم القطعة</th>
              <th className="p-3 font-bold normal-case tracking-normal">الماركات</th>
              <th className="p-3 font-bold normal-case tracking-normal">السعر</th>
              <th className="p-3 font-bold normal-case tracking-normal">المخزون</th>
              <th className="p-3 font-bold normal-case tracking-normal">تفاعل</th>
              <th className="p-3 font-bold normal-case tracking-normal"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const ratingCount = Array.isArray(product.ratings) ? product.ratings.length : 0;
              const qty = Number(product.quantity) || 0;
              const stockTone = qty <= 0 ? "out" : qty <= 5 ? "low" : "ok";

              return (
                <tr
                  key={product.id}
                  className="border-t border-slate-100 hover:bg-slate-50/70 transition-colors"
                >
                  <td className="p-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center ring-1 ring-slate-200/80">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-slate-300 text-xs font-bold">بدون</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <p className="font-bold text-slate-900 leading-snug">{product.name}</p>
                  </td>
                  <td className="p-3 font-mono text-xs text-slate-600" dir="ltr">
                    {product.partNumber || "—"}
                  </td>
                  <td className="p-3 text-slate-600 max-w-[140px]">
                    <span className="line-clamp-2">{formatList(getProductBrands(product)) || "—"}</span>
                  </td>
                  <td className="p-3 font-semibold text-slate-800 whitespace-nowrap">
                    {product.price}{" "}
                    <span className="text-xs font-medium text-slate-400">ريال</span>
                  </td>
                  <td className="p-3">
                    <span className={`admin-stock admin-stock--${stockTone}`}>
                      {qty <= 0 ? "غير متوفر" : qty}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col gap-0.5 text-xs text-slate-500">
                      <span>{product.likes || 0} إعجاب</span>
                      <button
                        type="button"
                        onClick={() => setRatingsProduct(product)}
                        className="text-brand font-bold hover:underline text-start"
                      >
                        {ratingCount} تقييم
                      </button>
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <a
                        href={`/product/${product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="admin-table-action"
                      >
                        عرض
                      </a>
                      <button type="button" onClick={() => onEdit(product)} className="admin-table-action admin-table-action--brand">
                        تعديل
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="admin-table-action admin-table-action--danger disabled:opacity-50"
                      >
                        حذف
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {ratingsProduct && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setRatingsProduct(null)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 bg-slate-50/80">
              <div>
                <h3 className="font-extrabold text-slate-900">التقييمات</h3>
                <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[280px]">{ratingsProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setRatingsProduct(null)}
                className="admin-btn-ghost !py-1.5 !px-3 text-sm"
              >
                إغلاق
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[65vh] flex flex-col gap-3">
              {!ratingsProduct.ratings?.length ? (
                <p className="text-sm text-slate-500 text-center py-8">لا توجد تقييمات على هذا المنتج.</p>
              ) : (
                ratingsProduct.ratings.map((rating) => (
                  <div key={rating.id} className="rounded-xl border border-slate-200 bg-slate-50/40 p-3.5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{rating.name}</p>
                        <p className="text-xs text-amber-600 font-semibold my-0.5">
                          {"★".repeat(rating.stars)}
                          {"☆".repeat(5 - rating.stars)}
                        </p>
                        {rating.comment && <p className="text-sm text-slate-600 mt-1">{rating.comment}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteRating(ratingsProduct.id, rating.id)}
                        disabled={deletingRatingId === rating.id}
                        className="text-rose-600 text-xs font-bold hover:underline disabled:opacity-50 shrink-0"
                      >
                        {deletingRatingId === rating.id ? "جاري الحذف..." : "حذف"}
                      </button>
                    </div>
                  </div>
                ))
              )}
              <p className="text-xs text-slate-400 text-center pt-1">
                احذف التقييم غير المناسب، أو اتركه كما هو.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BoxIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M21 8l-9-5-9 5v8l9 5 9-5V8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M3.5 8.5 12 13l8.5-4.5M12 22V13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
