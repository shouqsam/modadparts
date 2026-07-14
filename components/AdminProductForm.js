"use client";

import { useEffect, useState } from "react";
import { resizeImageFile } from "../lib/image";
import { getProductBrands, getProductCategories, toStringList } from "../lib/productFields";
import MultiSelectField, { KNOWN_BRANDS, KNOWN_CATEGORIES } from "./MultiSelectField";

const emptyForm = {
  name: "",
  partNumber: "",
  brands: [],
  categories: [],
  price: "",
  quantity: "",
  description: "",
  image: ""
};

export default function AdminProductForm({ editingProduct, onSaved, onCancelEdit }) {
  const [form, setForm] = useState(emptyForm);
  const [imageError, setImageError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || "",
        partNumber: editingProduct.partNumber || "",
        brands: getProductBrands(editingProduct),
        categories: getProductCategories(editingProduct),
        price: editingProduct.price ?? "",
        quantity: editingProduct.quantity ?? "",
        description: editingProduct.description || "",
        image: editingProduct.image || ""
      });
    } else {
      setForm(emptyForm);
    }
  }, [editingProduct]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    try {
      const dataUrl = await resizeImageFile(file);
      update("image", dataUrl);
    } catch {
      setImageError("تعذر معالجة الصورة، جرّب صورة أخرى");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const brands = toStringList(form.brands);
    if (!form.name.trim()) {
      setError("اسم القطعة مطلوب");
      return;
    }
    if (brands.length === 0) {
      setError("اختر ماركة واحدة على الأقل (يمكن اختيار أكثر من ماركة مثل نيسان وإنفينيتي)");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        partNumber: form.partNumber,
        brands,
        categories: toStringList(form.categories),
        description: form.description,
        image: form.image,
        price: Number(form.price) || 0,
        quantity: Number(form.quantity) || 0
      };
      const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : "/api/admin/products";
      const method = editingProduct ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "تعذر الحفظ");
        return;
      }
      setForm(emptyForm);
      onSaved(data.product);
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-panel">
      <div className="mb-5">
        <h2 className="admin-panel-title">{editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}</h2>
        <p className="admin-panel-sub">
          يمكن اختيار أكثر من ماركة لنفس القطعة (مثل نيسان + إنفينيتي) وأكثر من فئة.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="اسم القطعة *">
          <input
            className="admin-input"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="مثال: طرمبة بنزين نيسان صني"
          />
        </Field>

        <Field label="رقم القطعة">
          <input
            className="admin-input"
            value={form.partNumber}
            onChange={(e) => update("partNumber", e.target.value)}
            placeholder="مثال: 17040-1HC0A"
            dir="ltr"
          />
        </Field>

        <MultiSelectField
          label="الماركات *"
          values={form.brands}
          onChange={(brands) => update("brands", brands)}
          suggestions={KNOWN_BRANDS}
          hint="اختر كل الماركات التي تناسب القطعة، مثال: نيسان وإنفينيتي."
          placeholder="ماركة أخرى ثم Enter"
        />

        <MultiSelectField
          label="الفئات"
          values={form.categories}
          onChange={(categories) => update("categories", categories)}
          suggestions={KNOWN_CATEGORIES}
          hint="يمكن اختيار أكثر من فئة لنفس القطعة."
          placeholder="فئة أخرى ثم Enter"
        />

        <Field label="السعر (ريال) *">
          <input
            type="number"
            min="0"
            step="0.01"
            className="admin-input"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </Field>

        <Field label="الكمية المتوفرة *">
          <input
            type="number"
            min="0"
            step="1"
            className="admin-input"
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
          />
        </Field>

        <Field label="صورة المنتج">
          <label className="admin-file">
            <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
            <span>{form.image ? "تغيير الصورة" : "اختر صورة للمنتج"}</span>
          </label>
          {imageError && <p className="text-rose-600 text-xs mt-1.5">{imageError}</p>}
        </Field>
      </div>

      <Field label="وصف (اختياري)" className="mt-4">
        <textarea
          className="admin-input min-h-[88px] resize-y"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      {form.image && (
        <div className="mt-4 w-28 h-28 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.image} alt="معاينة" className="w-full h-full object-cover" />
        </div>
      )}

      {error && <p className="mt-4 text-rose-700 text-sm bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">{error}</p>}

      <div className="flex flex-wrap gap-2 mt-5 pt-5 border-t border-slate-100">
        <button type="submit" disabled={saving} className="admin-btn-primary disabled:opacity-50">
          {saving ? "جاري الحفظ..." : editingProduct ? "حفظ التعديلات" : "إضافة المنتج"}
        </button>
        {editingProduct && (
          <button type="button" onClick={onCancelEdit} className="admin-btn-ghost">
            إلغاء التعديل
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children, className = "" }) {
  return (
    <label className={`flex flex-col gap-1.5 text-sm font-semibold text-slate-700 ${className}`}>
      {label}
      {children}
    </label>
  );
}
