"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import AdminProductForm from "./AdminProductForm";
import AdminProductTable from "./AdminProductTable";
import ExcelImportForm from "./ExcelImportForm";
import { SITE_SHORT_NAME } from "../lib/site";

const TABS = [
  { id: "products", label: "المنتجات" },
  { id: "form", label: "إضافة / تعديل" },
  { id: "import", label: "استيراد إكسل" }
];

export default function AdminDashboard({ initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editingProduct, setEditingProduct] = useState(null);
  const [tab, setTab] = useState("products");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter((p) => Number(p.quantity) <= 0).length;
    const lowStock = products.filter((p) => {
      const q = Number(p.quantity);
      return q > 0 && q <= 5;
    }).length;
    const ratings = products.reduce(
      (sum, p) => sum + (Array.isArray(p.ratings) ? p.ratings.length : 0),
      0
    );
    return { total, outOfStock, lowStock, ratings };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const brands = Array.isArray(p.brands) ? p.brands.join(" ") : p.brand || "";
      const hay = `${p.name || ""} ${p.partNumber || ""} ${brands}`.toLowerCase();
      return hay.includes(q);
    });
  }, [products, query]);

  async function refresh() {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
  }

  function upsertProduct(product) {
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.map((p) => (p.id === product.id ? product : p));
      return [product, ...prev];
    });
  }

  function handleSaved(product) {
    setEditingProduct(null);
    upsertProduct(product);
    setTab("products");
  }

  function handleDeleted(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingProduct?.id === id) setEditingProduct(null);
  }

  function handleEdit(product) {
    setEditingProduct(product);
    setTab("form");
  }

  function handleCancelEdit() {
    setEditingProduct(null);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="admin-shell min-h-screen">
      <header className="admin-header sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt={SITE_SHORT_NAME}
              className="h-10 w-10 rounded-lg object-contain bg-white/10 p-1 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-white font-extrabold text-base sm:text-lg leading-tight truncate">
                لوحة إدارة {SITE_SHORT_NAME}
              </p>
              <p className="text-white/55 text-xs hidden sm:block">إدارة المنتجات والمخزون</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <a href="/api/admin/export" className="admin-header-btn hidden md:inline-flex">
              نسخة احتياطية
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer" className="admin-header-btn">
              المتجر
            </a>
            <button type="button" onClick={handleLogout} className="admin-header-btn admin-header-btn--danger">
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <StatCard label="إجمالي المنتجات" value={stats.total} tone="default" />
          <StatCard label="مخزون منخفض" value={stats.lowStock} tone="amber" />
          <StatCard label="غير متوفر" value={stats.outOfStock} tone="rose" />
          <StatCard label="التقييمات" value={stats.ratings} tone="default" />
        </section>

        <nav className="admin-tabs" aria-label="أقسام لوحة التحكم">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`admin-tab ${tab === item.id ? "admin-tab--active" : ""}`}
            >
              {item.label}
              {item.id === "form" && editingProduct ? (
                <span className="admin-tab-badge">تعديل</span>
              ) : null}
            </button>
          ))}
        </nav>

        {tab === "products" && (
          <section className="admin-panel animate-admin-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="admin-panel-title">كتالوج المنتجات</h2>
                <p className="admin-panel-sub">
                  {filteredProducts.length === products.length
                    ? `${products.length} منتج`
                    : `${filteredProducts.length} من ${products.length} منتج`}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <span className="pointer-events-none absolute inset-y-0 start-3 flex items-center text-slate-400">
                    <SearchIcon />
                  </span>
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="بحث بالاسم أو رقم القطعة..."
                    className="admin-input pe-3 ps-10"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditingProduct(null);
                    setTab("form");
                  }}
                  className="admin-btn-primary whitespace-nowrap"
                >
                  منتج جديد
                </button>
              </div>
            </div>
            <AdminProductTable
              products={filteredProducts}
              onEdit={handleEdit}
              onDeleted={handleDeleted}
              onUpdated={upsertProduct}
            />
          </section>
        )}

        {tab === "form" && (
          <section className="animate-admin-in">
            <AdminProductForm
              editingProduct={editingProduct}
              onSaved={handleSaved}
              onCancelEdit={handleCancelEdit}
            />
          </section>
        )}

        {tab === "import" && (
          <section className="animate-admin-in">
            <ExcelImportForm onImported={refresh} />
          </section>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`admin-stat admin-stat--${tone}`}>
      <p className="admin-stat-label">{label}</p>
      <p className="admin-stat-value">{value}</p>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.3-4.3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
