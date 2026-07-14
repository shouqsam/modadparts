"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminProductForm from "./AdminProductForm";
import AdminProductTable from "./AdminProductTable";
import ExcelImportForm from "./ExcelImportForm";

export default function AdminDashboard({ initialProducts }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editingProduct, setEditingProduct] = useState(null);

  async function refresh() {
    const res = await fetch("/api/admin/products");
    if (res.ok) {
      const data = await res.json();
      setProducts(data.products);
    }
  }

  function handleSaved(product) {
    setEditingProduct(null);
    setProducts((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) return prev.map((p) => (p.id === product.id ? product : p));
      return [product, ...prev];
    });
  }

  function handleDeleted(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    if (editingProduct?.id === id) setEditingProduct(null);
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-brand text-white">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="font-extrabold text-lg">لوحة تحكم المتجر</h1>
          <div className="flex items-center gap-3">
            <a href="/api/admin/export" className="text-sm underline">
              تنزيل نسخة احتياطية (إكسل)
            </a>
            <a href="/" target="_blank" className="text-sm underline">
              عرض المتجر
            </a>
            <button onClick={handleLogout} className="text-sm bg-white/10 px-3 py-1.5 rounded-lg font-bold">
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 flex flex-col gap-6">
        <AdminProductForm
          editingProduct={editingProduct}
          onSaved={handleSaved}
          onCancelEdit={() => setEditingProduct(null)}
        />

        <ExcelImportForm onImported={refresh} />

        <div>
          <h2 className="font-extrabold text-lg mb-3">المنتجات ({products.length})</h2>
          <AdminProductTable
            products={products}
            onEdit={setEditingProduct}
            onDeleted={handleDeleted}
            onUpdated={handleSaved}
          />
        </div>
      </main>
    </div>
  );
}
