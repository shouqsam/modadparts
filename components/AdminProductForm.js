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
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <h2 className="font-extrabold text-lg">{editingProduct ? "تعديل منتج" : "إضافة منتج جديد"}</h2>
      <p className="text-xs text-gray-500">
        يمكن اختيار أكثر من ماركة لنفس القطعة (مثل نيسان + إنفينيتي) وأكثر من فئة.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="اسم القطعة *">
          <input
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="مثال: طرمبة بنزين نيسان صني"
          />
        </Field>

        <Field label="رقم القطعة">
          <input
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
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
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
          />
        </Field>

        <Field label="الكمية المتوفرة *">
          <input
            type="number"
            min="0"
            step="1"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand"
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
          />
        </Field>

        <Field label="صورة المنتج">
          <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
          {imageError && <p className="text-red-600 text-xs mt-1">{imageError}</p>}
        </Field>
      </div>

      <Field label="وصف (اختياري)">
        <textarea
          className="w-full rounded-xl border border-gray-200 px-4 py-2.5 min-h-[70px] focus:outline-none focus:ring-2 focus:ring-brand"
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </Field>

      {form.image && (
        <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={form.image} alt="معاينة" className="w-full h-full object-cover" />
        </div>
      )}

      {error && <p className="text-red-600 text-sm">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="bg-brand text-white font-bold py-2.5 px-6 rounded-xl disabled:opacity-50"
        >
          {saving ? "جاري الحفظ..." : editingProduct ? "حفظ التعديلات" : "إضافة المنتج"}
        </button>
        {editingProduct && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="border border-gray-200 font-bold py-2.5 px-6 rounded-xl"
          >
            إلغاء
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1 text-sm font-semibold text-gray-700">
      {label}
      {children}
    </label>
  );
}
