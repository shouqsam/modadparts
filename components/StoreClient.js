"use client";

import { useEffect, useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import BrandFilter from "./BrandFilter";
import HomeSections from "./HomeSections";
import StoreLogo from "./StoreLogo";
import WhatsappFloatingButton from "./WhatsappFloatingButton";
import { getProductBrands, getProductCategories, productHasBrand } from "../lib/productFields";

const PAGE_SIZE = 8;

function normalizeTerm(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[\s\-_/\\.]/g, "");
}

function parseSearchTerms(query) {
  return String(query || "")
    .split(/[\s,;،|/]+/)
    .map((term) => term.trim())
    .filter(Boolean);
}

function productMatchesTerm(product, term) {
  const normalizedTerm = normalizeTerm(term);
  const rawTerm = term.toLowerCase();

  const partNumber = normalizeTerm(product.partNumber);
  if (partNumber && (partNumber.includes(normalizedTerm) || normalizedTerm.includes(partNumber))) {
    return true;
  }

  const brands = getProductBrands(product).join(" ");
  const categories = getProductCategories(product).join(" ");
  const haystack = `${product.name || ""} ${brands} ${categories} ${product.description || ""} ${product.partNumber || ""}`.toLowerCase();
  return haystack.includes(rawTerm);
}

export default function StoreClient({ products }) {
  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("الكل");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    if (q) setQuery(q);
  }, []);

  const brands = useMemo(() => {
    const set = new Set();
    products.forEach((p) => getProductBrands(p).forEach((b) => set.add(b)));
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ar"));
  }, [products]);

  const searchTerms = useMemo(() => parseSearchTerms(query), [query]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (!productHasBrand(p, brand)) return false;
      if (searchTerms.length === 0) return true;
      return searchTerms.some((term) => productMatchesTerm(p, term));
    });
  }, [products, brand, searchTerms]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [query, brand]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  function goToPage(nextPage) {
    const safe = Math.min(Math.max(1, nextPage), totalPages);
    setPage(safe);
    if (typeof document !== "undefined") {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3.5 flex flex-row items-center gap-2.5 sm:gap-4 md:gap-6">
          <a href="/" className="shrink-0" aria-label="مدد قطع غيار التجارة">
            <StoreLogo className="h-10 sm:h-12 md:h-14 w-auto max-w-[72px] sm:max-w-[100px] md:max-w-[140px] object-contain" />
          </a>

          <div className="relative flex-1 min-w-0">
            <span className="pointer-events-none absolute inset-y-0 right-2.5 sm:right-3 flex items-center text-gray-400">
              <SearchIcon />
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث برقم القطعة..."
              className="w-full rounded-xl border border-gray-200 bg-[#f8f9fb] pr-9 sm:pr-11 pl-3 sm:pl-4 py-2.5 sm:py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white"
              aria-label="البحث عن رقم القطعة"
            />
          </div>
        </div>

        <div className="border-t border-gray-100 bg-[#fafbfc]">
          <div className="max-w-6xl mx-auto px-4 py-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-gray-600">
            <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
              <PinIcon />
              الرياض
            </span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <span className="inline-flex items-center gap-1.5">
              <TruckMiniIcon />
              توصيل لجميع مناطق المملكة العربية السعودية خلال 12 ساعة إلى يوم واحد
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-10 md:gap-14">
        <section className="text-center max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-snug">
            قطع غيار سيارات أصلية في الرياض
          </h1>
          <p className="mt-3 text-sm sm:text-base text-gray-500 leading-relaxed">
            متجر مدد قطع غيار التجارة يوفر قطع غيار سيارات لنيسان وإنفينيتي ورينو، مع بحث سريع برقم
            القطعة وتوصيل لجميع مناطق المملكة.
          </p>
        </section>

        <section id="products" className="flex flex-col gap-5 scroll-mt-6" aria-label="منتجات قطع غيار السيارات">
          <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">قطع غيار السيارات المتوفرة</h2>
          <BrandFilter brands={brands} active={brand} onChange={setBrand} />

          {searchTerms.length > 1 && (
            <p className="text-sm text-gray-500">
              البحث عن {searchTerms.length} أرقام: {searchTerms.join(" · ")}
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="text-center text-gray-500 py-20 bg-white rounded-2xl">
              لا توجد نتائج مطابقة حالياً. جرّب رقم قطعة آخر أو تواصل معنا مباشرة عبر واتساب.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 items-stretch">
                {pageItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white rounded-2xl border border-gray-100 px-4 py-3">
                  <p className="text-sm text-gray-500">
                    صفحة {page} من {totalPages} — عرض {pageItems.length} من {filtered.length} منتج
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      className="px-4 py-2 rounded-xl border border-gray-200 font-bold text-sm disabled:opacity-40 hover:bg-gray-50"
                    >
                      الصفحة السابقة
                    </button>
                    <button
                      type="button"
                      onClick={() => goToPage(page + 1)}
                      disabled={page >= totalPages}
                      className="px-4 py-2 rounded-xl bg-brand text-white font-bold text-sm disabled:opacity-40 hover:brightness-110"
                    >
                      الصفحة التالية
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <HomeSections />
      </main>

      <footer className="text-center text-gray-400 text-sm py-8">
        جميع الحقوق محفوظة — مدد قطع غيار التجارة، الرياض
      </footer>

      <WhatsappFloatingButton />
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M12 21s7-5.4 7-11a7 7 0 1 0-14 0c0 5.6 7 11 7 11z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function TruckMiniIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M1 7h11v10H1zM12 10h4l3 3v4h-7V10z" strokeLinejoin="round" />
      <circle cx="5.5" cy="18.5" r="1.5" />
      <circle cx="16.5" cy="18.5" r="1.5" />
    </svg>
  );
}
