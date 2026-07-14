import { NextResponse } from "next/server";
import { enrichPartWithGemini, getGeminiApiKey } from "../../../../../../lib/gemini";
import { findPartImageUrl } from "../../../../../../lib/findPartImage";
import { lookupPartContext } from "../../../../../../lib/partLookup";
import { getProductById, updateProduct } from "../../../../../../lib/db";

export async function POST(request, { params }) {
  const id = params?.id;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  const partNumber = String(product.partNumber || "").trim();
  if (!partNumber && !String(product.name || "").trim()) {
    return NextResponse.json(
      { error: "أضف رقم القطعة أو اسم المنتج أولاً ثم استخدم الذكاء الاصطناعي" },
      { status: 400 }
    );
  }

  if (!getGeminiApiKey()) {
    return NextResponse.json(
      {
        error:
          "لم يتم ضبط GEMINI_API_KEY. أضفه في ملف .env.local من https://aistudio.google.com/apikey ثم أعد تشغيل السيرفر."
      },
      { status: 503 }
    );
  }

  try {
    const context = await lookupPartContext(partNumber || product.name, {
      name: product.name,
      brand: product.brand
    });
    const fields = await enrichPartWithGemini({
      partNumber: partNumber || product.name,
      existing: product,
      webContext: context.text
    });

    const nextName = fields.name || product.name;
    const nextBrand = fields.brand || product.brand;

    let image = fields.image || "";
    if (!image && context.images[0]) image = context.images[0];
    if (!image) {
      image = await findPartImageUrl({
        name: nextName,
        brand: nextBrand,
        partNumber
      });
    }

    const updated = await updateProduct(id, {
      name: nextName,
      brand: fields.brand || product.brand,
      brands: fields.brands || fields.brand || product.brands || product.brand,
      category: fields.category || product.category,
      categories: fields.categories || fields.category || product.categories || product.category,
      description: fields.description || product.description,
      image: image || product.image,
      partNumber: product.partNumber,
      price: product.price,
      quantity: product.quantity
    });

    return NextResponse.json({
      product: updated,
      fields: { ...fields, image: image || fields.image || "" },
      source: "gemini+image-lookup"
    });
  } catch (err) {
    if (err?.code === "NO_API_KEY") {
      return NextResponse.json(
        { error: "لم يتم ضبط GEMINI_API_KEY في .env.local" },
        { status: 503 }
      );
    }
    if (err?.code === "QUOTA") {
      return NextResponse.json(
        {
          error:
            "انتهت الحصة المجانية لـ Gemini حالياً. انتظر قليلاً أو فعّل الفوترة من Google AI Studio ثم أعد المحاولة."
        },
        { status: 429 }
      );
    }
    if (err?.code === "AUTH") {
      return NextResponse.json(
        { error: "مفتاح Gemini غير صالح. أنشئ مفتاحاً جديداً من https://aistudio.google.com/apikey" },
        { status: 401 }
      );
    }
    console.error("enrich failed", err?.code || "", String(err?.message || err).slice(0, 300));
    return NextResponse.json(
      {
        error:
          "تعذر إثراء المنتج بالذكاء الاصطناعي. تأكد أن رقم القطعة صحيح (مثل 17040-1HC0A) وليس سنوات الموديل فقط."
      },
      { status: 502 }
    );
  }
}
