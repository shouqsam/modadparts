import { getGeminiApiKey } from "./gemini";

function isLikelyImageUrl(url) {
  if (!url || !/^https?:\/\//i.test(url)) return false;
  if (/logo|sprite|favicon|pixel|1x1|placeholder|avatar|icon/i.test(url)) return false;
  return true;
}

function extractFirstUrl(text) {
  const match = String(text || "").match(/https?:\/\/[^\s"'<>]+/i);
  if (!match) return "";
  return match[0].replace(/[),.;]+$/g, "");
}

async function openverseImage(query) {
  const url = `https://api.openverse.org/v1/images/?q=${encodeURIComponent(query)}&page_size=8`;
  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "SelmaxParts/1.0" },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return "";
    const data = await res.json();
    const results = Array.isArray(data?.results) ? data.results : [];
    for (const item of results) {
      const candidate = item.url || item.thumbnail || "";
      if (isLikelyImageUrl(candidate)) return candidate;
    }
  } catch {
    // ignore
  }
  return "";
}

async function geminiImageUrl({ name, brand, partNumber }) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return "";

  const model = process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest";
  const prompt = [
    "Find one publicly accessible direct product photo URL for this automotive spare part.",
    "Prefer a clear photo of the part itself (not a logo, banner, or website screenshot).",
    "Return ONLY the raw https URL ending preferably with jpg/png/webp, or NONE if not found.",
    `Name: ${name || ""}`,
    `Brand: ${brand || ""}`,
    `Part number: ${partNumber || ""}`,
    "Search Google/PartsOuq/auto-parts catalogs if needed."
  ].join("\n");

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }],
        generationConfig: { temperature: 0.1 }
      })
    });
    if (!res.ok) {
      const res2 = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1 }
        })
      });
      if (!res2.ok) return "";
      const data2 = await res2.json();
      const text2 = data2?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
      const url2 = extractFirstUrl(text2);
      return isLikelyImageUrl(url2) ? url2 : "";
    }
    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
    if (/^none$/i.test(text.trim())) return "";
    const url = extractFirstUrl(text);
    return isLikelyImageUrl(url) ? url : "";
  } catch {
    return "";
  }
}

function englishishQuery({ name, brand, partNumber }) {
  const parts = [brand, name, partNumber, "car auto spare part"].filter(Boolean);
  return parts.join(" ").replace(/\s+/g, " ").trim();
}


export async function findPartImageUrl({ name = "", brand = "", partNumber = "" } = {}) {
  const queries = [
    englishishQuery({ name, brand, partNumber }),
    [brand, name, "automotive part"].filter(Boolean).join(" "),
    [name, brand].filter(Boolean).join(" ")
  ].filter((q, idx, arr) => q && arr.indexOf(q) === idx);

  for (const q of queries) {
    const fromOpenverse = await openverseImage(q);
    if (fromOpenverse) return fromOpenverse;
  }

  const fromGemini = await geminiImageUrl({ name, brand, partNumber });
  if (fromGemini) return fromGemini;

  if (brand) {
    const fallback = await openverseImage(`${brand} car engine spare part`);
    if (fallback) return fallback;
  }

  return "";
}
