import { NextResponse } from "next/server";
import { addProduct, getProducts } from "../../../../lib/db";

const MAX_IMAGE_LENGTH = 4_000_000; // ~3MB binary as base64

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

export async function GET() {
  const products = await getProducts();
  return NextResponse.json({ products });
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const error = validate(body);
  if (error) return NextResponse.json({ error }, { status: 400 });

  const product = await addProduct(body);
  return NextResponse.json({ product }, { status: 201 });
}
