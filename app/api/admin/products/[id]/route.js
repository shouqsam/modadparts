import { NextResponse } from "next/server";
import { deleteProduct, getProductById, updateProduct } from "../../../../../lib/db";

const MAX_IMAGE_LENGTH = 4_000_000;

function validate(body) {
  if (!body || typeof body !== "object") return "بيانات غير صالحة";
  if (!body.name || !String(body.name).trim()) return "اسم القطعة مطلوب";
  const brands = Array.isArray(body.brands)
    ? body.brands
    : String(body.brand || "")
        .split(/[,،;/|]+/)
        .map((v) => v.trim())
        .filter(Boolean);
  if (!brands.length) return "اختر ماركة واحدة على الأقل";
  const price = Number(body.price);
  if (!Number.isFinite(price) || price < 0) return "السعر غير صالح";
  const quantity = Number(body.quantity);
  if (!Number.isFinite(quantity) || quantity < 0) return "الكمية غير صالحة";
  if (body.image && typeof body.image === "string" && body.image.length > MAX_IMAGE_LENGTH) {
    return "حجم الصورة كبير جداً، الرجاء اختيار صورة أصغر";
  }
  return null;
}

export async function PUT(request, { params }) {
  const existing = await getProductById(params.id);
  if (!existing) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const merged = { ...existing, ...body };
  const error = validate(merged);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const product = await updateProduct(params.id, body);
  return NextResponse.json({ product });
}

export async function DELETE(request, { params }) {
  const ok = await deleteProduct(params.id);
  if (!ok) return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
