import { NextResponse } from "next/server";
import { enrichPartWithGemini, getGeminiApiKey } from "../../../../lib/gemini";
import { findPartImageUrl } from "../../../../lib/findPartImage";
import { lookupPartContext } from "../../../../lib/partLookup";

/**
 * Preview enrichment for the admin form (does not save).
 * Body: { partNumber, name?, brand?, category?, description?, image? }
 */
export async function POST(request) {
  if (!getGeminiApiKey()) {
    return NextResponse.json(
      {
        error:
          "لم يتم ضبط GEMINI_API_KEY. أضفه في ملف .env.local من https://aistudio.google.com/apikey ثم أعد تشغيل السيرفر."
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const partNumber = String(body?.partNumber || "").trim();
  const name = String(body?.name || "").trim();
  if (!partNumber && !name) {
    return NextResponse.json(
      { error: "رقم القطعة أو اسم المنتج مطلوب للإثراء بالذكاء الاصطناعي" },
      { status: 400 }
    );
  }

  try {
    const context = await lookupPartContext(partNumber || name, {
      name,
      brand: body?.brand
    });
    const fields = await enrichPartWithGemini({
      partNumber: partNumber || name,
      existing: body || {},
      webContext: context.text
    });

    const nextName = fields.name || name;
    const nextBrand = fields.brand || body?.brand || "";

    let image = fields.image || "";
    if (!image && context.images[0]) image = context.images[0];
    if (!image) {
      image = await findPartImageUrl({
        name: nextName,
        brand: nextBrand,
        partNumber
      });
    }
    fields.image = image || fields.image || "";

    return NextResponse.json({ fields });
  } catch (err) {
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
    console.error("enrich preview failed", err?.code || "", String(err?.message || err).slice(0, 300));
    return NextResponse.json(
      { error: "تعذر جلب بيانات القطعة بالذكاء الاصطناعي" },
      { status: 502 }
    );
  }
}
