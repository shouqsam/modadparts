"use client";

import Link from "next/link";
import { buildWhatsappLink, productInquiryMessage } from "../lib/whatsapp";
import { getProductBrands, getProductCategories } from "../lib/productFields";

const MAX_VISIBLE_TAGS = 2;

export default function ProductCard({ product }) {
  const available = Number(product.quantity) > 0;
  const message = productInquiryMessage(product);
  const link = buildWhatsappLink(message);
  const brands = getProductBrands(product);
  const categories = getProductCategories(product);
  const tags = [
    ...brands.map((brand) => ({ label: brand, kind: "brand" })),
    ...categories.map((category) => ({ label: category, kind: "category" })),
  ];
  const visibleTags = tags.slice(0, MAX_VISIBLE_TAGS);
  const hiddenCount = tags.length - visibleTags.length;
  const likes = Number(product.likes) || 0;
  const ratingCount = Array.isArray(product.ratings) ? product.ratings.length : 0;
  const avg =
    ratingCount > 0
      ? Math.round(
          (product.ratings.reduce((acc, r) => acc + Number(r.stars || 0), 0) / ratingCount) * 10
        ) / 10
      : 0;

  return (
    <article className="group h-full bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:border-brand/30 hover:shadow-md transition">
      <Link href={`/product/${product.id}`} className="relative aspect-[4/3] bg-gray-50 overflow-hidden block">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-3xl">🔧</div>
        )}
        <span
          className={`absolute top-2 left-2 text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-md backdrop-blur-sm ${
            available ? "bg-white/90 text-green-700" : "bg-white/90 text-red-600"
          }`}
        >
          {available ? "متوفر" : "غير متوفر"}
        </span>
      </Link>

      <div className="p-3 sm:p-3.5 flex flex-col gap-1.5 flex-1">
        {product.partNumber && (
          <p className="text-[10px] sm:text-xs text-gray-400 font-mono tracking-wide" dir="ltr">
            {product.partNumber}
          </p>
        )}

        <Link href={`/product/${product.id}`}>
          <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug line-clamp-2 hover:text-brand transition-colors">
            {product.name}
          </h3>
        </Link>

        {(visibleTags.length > 0 || hiddenCount > 0) && (
          <div className="flex flex-wrap items-center gap-1">
            {visibleTags.map((tag) => (
              <span
                key={`${tag.kind}-${tag.label}`}
                className={`text-[10px] sm:text-xs font-medium px-1.5 py-0.5 rounded ${
                  tag.kind === "brand"
                    ? "bg-brand/10 text-brand"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {tag.label}
              </span>
            ))}
            {hiddenCount > 0 && (
              <span className="text-[10px] sm:text-xs text-gray-400 font-medium">+{hiddenCount}</span>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-500">
          <span>❤ {likes}</span>
          <span>★ {avg > 0 ? avg : "—"}</span>
        </div>

        <div className="mt-auto pt-2 flex flex-col gap-2">
          <p className="text-base sm:text-lg font-extrabold text-brand leading-none">
            {product.price}
            <span className="text-xs font-semibold text-brand/80 ms-1">ريال</span>
          </p>

          <div className="grid grid-cols-2 gap-1.5">
            <Link
              href={`/product/${product.id}`}
              className="flex items-center justify-center rounded-lg border border-gray-200 text-gray-700 text-xs sm:text-sm font-bold py-2 hover:bg-gray-50 transition"
            >
              التفاصيل
            </Link>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1 bg-whatsapp hover:brightness-95 text-white text-xs sm:text-sm font-bold py-2 rounded-lg transition"
            >
              <WhatsappIcon />
              واتساب
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}

function WhatsappIcon() {
  return (
    <svg viewBox="0 0 32 32" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M16.004 3C9.377 3 4 8.373 4 15c0 2.34.66 4.523 1.804 6.383L4 29l7.79-1.767A11.94 11.94 0 0 0 16.004 27C22.63 27 28 21.627 28 15S22.63 3 16.004 3Zm0 21.7c-1.98 0-3.822-.55-5.396-1.5l-.386-.23-4.62 1.048 1.03-4.5-.252-.4A9.63 9.63 0 0 1 5.3 15c0-5.9 4.8-10.7 10.704-10.7 5.9 0 10.7 4.8 10.7 10.7s-4.8 10.7-10.7 10.7Zm5.87-8.02c-.32-.16-1.9-.94-2.196-1.05-.294-.107-.508-.16-.722.16-.213.32-.827 1.05-1.014 1.265-.187.213-.373.24-.693.08-.32-.16-1.35-.497-2.573-1.586-.95-.847-1.593-1.894-1.78-2.214-.187-.32-.02-.493.14-.653.144-.144.32-.373.48-.56.16-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.72-1.734-.986-2.374-.26-.626-.523-.54-.72-.55l-.613-.01c-.213 0-.56.08-.853.4-.293.32-1.12 1.094-1.12 2.667 0 1.573 1.147 3.094 1.307 3.307.16.213 2.257 3.445 5.467 4.83.764.33 1.36.527 1.826.674.767.244 1.466.21 2.018.127.616-.092 1.9-.777 2.167-1.527.267-.75.267-1.393.187-1.527-.08-.133-.293-.213-.613-.373Z" />
    </svg>
  );
}
