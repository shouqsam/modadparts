"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import StoreLogo from "./StoreLogo";
import { buildWhatsappLink, productInquiryMessage } from "../lib/whatsapp";
import { getProductBrands, getProductCategories } from "../lib/productFields";

const LIKED_KEY = "ssparts_liked_products";

function readLikedSet() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(LIKED_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

function writeLikedSet(set) {
  localStorage.setItem(LIKED_KEY, JSON.stringify([...set]));
}

function averageRating(ratings = []) {
  if (!ratings.length) return 0;
  const sum = ratings.reduce((acc, r) => acc + Number(r.stars || 0), 0);
  return Math.round((sum / ratings.length) * 10) / 10;
}

function formatDate(ts) {
  try {
    return new Date(ts).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "";
  }
}

export default function ProductDetailClient({ product: initialProduct }) {
  const [product, setProduct] = useState(initialProduct);
  const [liked, setLiked] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [stars, setStars] = useState(5);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [ratingBusy, setRatingBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const brands = getProductBrands(product);
  const categories = getProductCategories(product);
  const available = Number(product.quantity) > 0;
  const avg = useMemo(() => averageRating(product.ratings), [product.ratings]);
  const whatsapp = buildWhatsappLink(productInquiryMessage(product));

  useEffect(() => {
    setLiked(readLikedSet().has(product.id));
  }, [product.id]);

  function handleSearch(e) {
    e.preventDefault();
    const q = searchQuery.trim();
    const url = q ? `/?q=${encodeURIComponent(q)}#products` : "/#products";
    window.location.href = url;
  }

  async function handleLike() {
    if (likeBusy) return;
    setLikeBusy(true);
    setError("");
    const nextLiked = !liked;
    try {
      const res = await fetch(`/api/products/${product.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: nextLiked ? "like" : "unlike" })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر تسجيل الإعجاب");
        return;
      }
      setProduct((prev) => ({ ...prev, likes: data.likes }));
      setLiked(nextLiked);
      const set = readLikedSet();
      if (nextLiked) set.add(product.id);
      else set.delete(product.id);
      writeLikedSet(set);
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLikeBusy(false);
    }
  }

  async function handleSubmitRating(e) {
    e.preventDefault();
    if (ratingBusy) return;
    setRatingBusy(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch(`/api/products/${product.id}/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, stars, comment })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر إرسال التقييم");
        return;
      }
      setProduct(data.product);
      setComment("");
      setStars(5);
      setMessage("شكراً لتقييمك!");
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setRatingBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-row items-center gap-2.5 sm:gap-4 md:gap-6">
          <Link href="/" className="shrink-0" aria-label="مدد قطع غيار التجارة">
            <StoreLogo className="h-10 sm:h-12 w-auto max-w-[72px] sm:max-w-[100px] object-contain" />
          </Link>

          <form onSubmit={handleSearch} className="relative flex-1 min-w-0">
            <span className="pointer-events-none absolute inset-y-0 right-2.5 sm:right-3 flex items-center text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث برقم القطعة..."
              className="w-full rounded-xl border border-gray-200 bg-[#f8f9fb] pr-9 sm:pr-11 pl-3 sm:pl-4 py-2.5 sm:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
              aria-label="البحث عن رقم القطعة"
            />
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-brand font-bold text-sm mb-4 hover:underline"
          aria-label="العودة إلى الصفحة الرئيسية"
        >
          <BackArrowIcon />
          العودة للرئيسية
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <div className="aspect-[4/3] bg-gray-50 flex items-center justify-center">
              {product.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-gray-300 text-6xl">🔧</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-snug">
                {product.name}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {brands.map((brand) => (
                <span key={brand} className="text-xs font-bold px-2.5 py-1 rounded-lg bg-brand/10 text-brand">
                  {brand}
                </span>
              ))}
              {categories.map((category) => (
                <span key={category} className="text-xs px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600">
                  {category}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700">
                <StarIcon filled />
                {avg > 0 ? avg : "—"}
                <span className="text-gray-400 font-normal">({product.ratings?.length || 0} تقييم)</span>
              </span>
              <span className="text-gray-300">|</span>
              <span className="inline-flex items-center gap-1.5 text-brand">
                <HeartIcon filled />
                <span className="text-gray-700">{product.likes || 0} إعجاب</span>
              </span>
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-md ${
                  available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}
              >
                {available ? `متوفر (${product.quantity})` : "غير متوفر حالياً"}
              </span>
            </div>

            {product.partNumber && (
              <p className="text-xs sm:text-sm text-gray-500">
                رقم القطعة:{" "}
                <span className="font-mono text-gray-700 tracking-wide" dir="ltr">
                  {product.partNumber}
                </span>
              </p>
            )}

            <p className="text-3xl font-extrabold text-brand">
              {product.price} <span className="text-base font-semibold">ريال</span>
            </p>

            {product.description && (
              <p className="text-gray-600 leading-relaxed text-sm sm:text-base whitespace-pre-wrap">
                {product.description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleLike}
                disabled={likeBusy}
                className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-bold border transition disabled:opacity-60 shrink-0 ${
                  liked
                    ? "bg-brand text-white border-brand"
                    : "bg-white text-brand border-brand/40 hover:bg-brand/5"
                }`}
              >
                <HeartIcon filled={liked} className="w-5 h-5 shrink-0" />
                <span>{liked ? "أعجبني" : "إعجاب"}</span>
              </button>

              <a
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex flex-1 items-center justify-center gap-2 bg-whatsapp hover:brightness-95 text-white font-bold py-3 rounded-xl transition"
              >
                <WhatsappIcon />
                {available ? "استفسار عبر واتساب" : "اسأل عن التوفر عبر واتساب"}
              </a>
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">{error}</p>}
            {message && <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-3 py-2">{message}</p>}
          </div>
        </div>

        <section className="mt-8 sm:mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <form onSubmit={handleSubmitRating} className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm flex flex-col gap-3">
            <h2 className="font-extrabold text-lg text-gray-900">أضف تقييمك</h2>
            <p className="text-sm text-gray-500 -mt-1">قيّم تجربتك مع هذه القطعة لمساعدة الزوار الآخرين.</p>

            <div className="flex items-center gap-1.5" role="radiogroup" aria-label="التقييم بالنجوم">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStars(value)}
                  className="p-1"
                  aria-label={`${value} نجوم`}
                  aria-checked={stars === value}
                  role="radio"
                >
                  <StarIcon filled={value <= stars} large />
                </button>
              ))}
            </div>

            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسمك (اختياري)"
              className="w-full rounded-xl border border-gray-200 bg-[#f8f9fb] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
              maxLength={40}
            />

            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="تعليقك (اختياري)"
              rows={3}
              maxLength={500}
              className="w-full rounded-xl border border-gray-200 bg-[#f8f9fb] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand resize-none"
            />

            <button
              type="submit"
              disabled={ratingBusy}
              className="self-start bg-brand text-white font-bold px-5 py-2.5 rounded-xl hover:brightness-95 disabled:opacity-60 transition"
            >
              {ratingBusy ? "جاري الإرسال..." : "إرسال التقييم"}
            </button>
          </form>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm">
            <h2 className="font-extrabold text-lg text-gray-900 mb-3">
              التقييمات ({product.ratings?.length || 0})
            </h2>
            {!product.ratings?.length ? (
              <p className="text-sm text-gray-500">لا توجد تقييمات بعد. كن أول من يقيّم.</p>
            ) : (
              <ul className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pe-1">
                {product.ratings.map((rating) => (
                  <li key={rating.id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className="font-bold text-sm text-gray-900">{rating.name}</p>
                      <span className="text-xs text-gray-400">{formatDate(rating.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 mb-1.5">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <StarIcon key={value} filled={value <= rating.stars} />
                      ))}
                    </div>
                    {rating.comment && <p className="text-sm text-gray-600 leading-relaxed">{rating.comment}</p>}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

function StarIcon({ filled = false, large = false }) {
  const size = large ? 28 : 16;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.6l2.4 4.86 5.36.78-3.88 3.78.92 5.34L12 16.9l-4.8 2.46.92-5.34-3.88-3.78 5.36-.78L12 3.6z"
        fill={filled ? "#E5A100" : "#E5E7EB"}
      />
    </svg>
  );
}

function HeartIcon({ filled = false, className = "w-4 h-4" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.5 12.572 12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.566Z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function BackArrowIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <path d="M5 12h14" strokeLinecap="round" />
      <path d="M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 32 32" width="18" height="18" fill="currentColor" aria-hidden="true">
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.66 4.523 1.804 6.383L4 29l7.79-1.767A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.7c-1.98 0-3.822-.55-5.396-1.5l-.386-.23-4.62 1.048 1.03-4.5-.252-.4A9.63 9.63 0 0 1 5.3 15c0-5.9 4.8-10.7 10.704-10.7 5.9 0 10.7 4.8 10.7 10.7s-4.8 10.7-10.7 10.7Zm5.87-8.02c-.32-.16-1.9-.94-2.196-1.05-.294-.107-.508-.16-.722.16-.213.32-.827 1.05-1.014 1.265-.187.213-.373.24-.693.08-.32-.16-1.35-.497-2.573-1.586-.95-.847-1.593-1.894-1.78-2.214-.187-.32-.02-.493.14-.653.144-.144.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.986-2.374-.26-.626-.523-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.667 0 1.573 1.147 3.094 1.307 3.307.16.213 2.257 3.445 5.467 4.83.764.33 1.36.527 1.826.674.767.244 1.466.21 2.018.127.616-.092 1.9-.777 2.167-1.527.267-.75.267-1.393.187-1.527-.08-.133-.293-.213-.613-.373Z" />
    </svg>
  );
}
