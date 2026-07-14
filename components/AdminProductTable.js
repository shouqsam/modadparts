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
    return <p className="text-gray-500 text-center py-8">لا توجد منتجات بعد. أضف منتجك الأول أعلاه.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p className="text-red-600 text-sm bg-red-50 border border-red-100 rounded-xl px-4 py-2">{error}</p>
      )}
      <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100">
        <table className="w-full text-sm text-right">
          <thead>
            <tr className="border-b border-gray-100 text-gray-500">
              <th className="p-3">الصورة</th>
              <th className="p-3">الاسم</th>
              <th className="p-3">رقم القطعة</th>
              <th className="p-3">الماركات</th>
              <th className="p-3">السعر</th>
              <th className="p-3">الكمية</th>
              <th className="p-3">إعجابات</th>
              <th className="p-3">تقييمات</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => {
              const ratingCount = Array.isArray(product.ratings) ? product.ratings.length : 0;
              return (
                <tr key={product.id} className="border-b border-gray-50">
                  <td className="p-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                      {product.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-300">🔧</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 font-semibold">{product.name}</td>
                  <td className="p-3 font-mono text-xs" dir="ltr">
                    {product.partNumber || "—"}
                  </td>
                  <td className="p-3">{formatList(getProductBrands(product)) || "—"}</td>
                  <td className="p-3">{product.price} ريال</td>
                  <td className="p-3">{product.quantity}</td>
                  <td className="p-3">{product.likes || 0}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      onClick={() => setRatingsProduct(product)}
                      className="text-brand font-bold hover:underline"
                    >
                      {ratingCount}
                    </button>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2 justify-end">
                      <a
                        href={`/product/${product.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-600 font-bold hover:underline"
                      >
                        عرض
                      </a>
                      <button onClick={() => onEdit(product)} className="text-brand font-bold hover:underline">
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        disabled={deletingId === product.id}
                        className="text-red-600 font-bold hover:underline disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setRatingsProduct(null)}>
          <div
            className="bg-white rounded-2xl w-full max-w-lg max-h-[80vh] overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <h3 className="font-extrabold text-gray-900">تقييمات: {ratingsProduct.name}</h3>
              <button type="button" onClick={() => setRatingsProduct(null)} className="text-gray-500 font-bold">
                إغلاق
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[65vh] flex flex-col gap-3">
              {!ratingsProduct.ratings?.length ? (
                <p className="text-sm text-gray-500 text-center py-6">لا توجد تقييمات على هذا المنتج.</p>
              ) : (
                ratingsProduct.ratings.map((rating) => (
                  <div key={rating.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-sm">{rating.name}</p>
                        <p className="text-xs text-amber-600 font-semibold my-0.5">{"★".repeat(rating.stars)}{"☆".repeat(5 - rating.stars)}</p>
                        {rating.comment && <p className="text-sm text-gray-600 mt-1">{rating.comment}</p>}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteRating(ratingsProduct.id, rating.id)}
                        disabled={deletingRatingId === rating.id}
                        className="text-red-600 text-xs font-bold hover:underline disabled:opacity-50 shrink-0"
                      >
                        {deletingRatingId === rating.id ? "جاري الحذف..." : "حذف"}
                      </button>
                    </div>
                  </div>
                ))
              )}
              <p className="text-xs text-gray-400 text-center pt-1">
                احذف التقييم غير المناسب، أو اتركه كما هو.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
