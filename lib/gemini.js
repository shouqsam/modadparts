const DEFAULT_MODEL = "gemini-flash-latest";

export function getGeminiApiKey() {
  return process.env.GEMINI_API_KEY?.trim() || "";
}

function extractJsonObject(text) {
  const raw = String(text || "").trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(raw.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

function cleanFields(parsed) {
  if (!parsed || typeof parsed !== "object") return null;
  const image = String(parsed.image || "").trim();
  const brand =
    Array.isArray(parsed.brands) ? parsed.brands.join("، ") : String(parsed.brand || "").trim();
  const category =
    Array.isArray(parsed.categories)
      ? parsed.categories.join("، ")
      : String(parsed.category || "").trim();
  return {
    name: String(parsed.name || "").trim(),
    brand,
    brands: brand,
    category,
    categories: category,
    description: String(parsed.description || "").trim(),
    image: image.startsWith("http://") || image.startsWith("https://") ? image : ""
  };
}

function parseGeminiHttpError(status, bodyText) {
  let message = "";
  try {
    message = JSON.parse(bodyText)?.error?.message || bodyText;
  } catch {
    message = bodyText;
  }
  const err = new Error(message || `Gemini HTTP ${status}`);
  err.code = status === 429 ? "QUOTA" : status === 401 || status === 403 ? "AUTH" : "GEMINI_ERROR";
  err.status = status;
  return err;
}

async function callGemini({ apiKey, model, prompt, withSearch }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const payload = {
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.2,
      responseMimeType: "application/json"
    }
  };
  // JSON mode + google_search often conflict; only attach search when explicitly requested.
  if (withSearch) payload.tools = [{ google_search: {} }];

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const text = await res.text();
  if (!res.ok) throw parseGeminiHttpError(res.status, text);
  return JSON.parse(text);
}

/**
 * Ask Gemini to enrich spare-part fields from part number + optional web context.
 */
export async function enrichPartWithGemini({ partNumber, existing = {}, webContext = "" }) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    const err = new Error("NO_API_KEY");
    err.code = "NO_API_KEY";
    throw err;
  }

  const configured = process.env.GEMINI_MODEL?.trim();
  const models = [...new Set([configured, DEFAULT_MODEL, "gemini-2.0-flash"].filter(Boolean))];

  const prompt = [
    "أنت مساعد لمتجر قطع غيار سيارات في السعودية اسمه «سلماكس قطع غيار التجارة».",
    "مطلوب منك تعبئة بيانات منتج اعتماداً على رقم القطعة والبيانات الحالية وسياق الويب إن وُجد.",
    "أرجع JSON فقط بدون Markdown بالحقول التالية:",
    '{"name":"","brand":"نيسان، إنفينيتي","category":"محرك، كهرباء","description":"","image":""}',
    "",
    "القواعد:",
    "- name: اسم عربي واضح وقصير للقطعة. إن وُجد اسم حالي جيد فحسّنه ولا تمسحه بلا داعٍ.",
    "- brand: الماركات المناسبة مفصولة بفاصلة عربية، ويمكن أكثر من ماركة إذا كانت القطعة مشتركة (مثال: نيسان، إنفينيتي).",
    "- category: فئة أو أكثر مفصولة بفاصلة عربية (محرك، فرامل، كهرباء...).",
    "- description: وصف عربي مفيد للعميل في جملتين تقريباً.",
    "- image: رابط https مباشر لصورة القطعة فقط إذا وجدته من السياق. وإلا اتركه فارغاً. لا تختلق روابط وهمية.",
    "- لا تُرجع السعر أو الكمية.",
    "- إذا كان رقم القطعة يبدو سنوات موديل وليس OEM، اعتمد على الاسم/الماركة الحالية لإكمال الوصف والفئة.",
    "",
    `رقم القطعة: ${partNumber}`,
    `بيانات حالية: ${JSON.stringify({
      name: existing.name || "",
      brand: existing.brand || "",
      category: existing.category || "",
      description: existing.description || "",
      image: existing.image || ""
    })}`,
    webContext ? `سياق من الويب/PartsOuq:\n${webContext.slice(0, 6000)}` : "لا يوجد سياق ويب إضافي."
  ].join("\n");

  let lastError = null;
  for (const model of models) {
    try {
      const data = await callGemini({ apiKey, model, prompt, withSearch: false });
      const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      const fields = cleanFields(extractJsonObject(text));
      if (!fields || (!fields.name && !fields.brand && !fields.description && !existing.name)) {
        const err = new Error("تعذر فهم رد الذكاء الاصطناعي");
        err.code = "BAD_AI_RESPONSE";
        throw err;
      }
      // Keep existing name if AI returned empty name but we already have one.
      if (!fields.name && existing.name) fields.name = existing.name;
      if (!fields.brand && existing.brand) fields.brand = existing.brand;
      return fields;
    } catch (err) {
      lastError = err;
      // Try next model on quota/not found.
      if (err?.code === "QUOTA" || err?.status === 404) continue;
      throw err;
    }
  }

  throw lastError || new Error("تعذر الاتصال بـ Gemini");
}
