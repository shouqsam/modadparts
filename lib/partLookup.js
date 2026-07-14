function stripHtml(html) {
  return String(html || "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImageUrls(html) {
  const urls = [];
  const re = /https?:\/\/[^"'>\s]+\.(?:jpg|jpeg|png|webp)(?:\?[^"'>\s]*)?/gi;
  let match;
  while ((match = re.exec(html)) && urls.length < 8) {
    const url = match[0];
    if (!/logo|icon|sprite|pixel|1x1|favicon/i.test(url)) urls.push(url);
  }
  return [...new Set(urls)];
}

async function fetchText(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SelmaxPartsBot/1.0; +https://localhost; spare-parts-lookup)",
        Accept: "text/html,application/xhtml+xml"
      },
      redirect: "follow"
    });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  } finally {
    clearTimeout(timer);
  }
}


export async function lookupPartContext(partNumber, extra = {}) {
  const qParts = [partNumber, extra.name, extra.brand].map((v) => String(v || "").trim()).filter(Boolean);
  if (qParts.length === 0) return { text: "", images: [] };

  const queries = [...new Set(qParts)];
  const chunks = [];
  const images = [];

  for (const q of queries) {
    const encoded = encodeURIComponent(q);
    const candidates = [
      `https://partsouq.com/en/search?q=${encoded}`,
      `https://partsouq.com/search?q=${encoded}`
    ];
    for (const url of candidates) {
      const html = await fetchText(url);
      if (!html) continue;
      const text = stripHtml(html).slice(0, 2500);
      if (text.length > 80) chunks.push(`Source: ${url}\n${text}`);
      for (const img of extractImageUrls(html)) {
        if (!images.includes(img)) images.push(img);
      }
      if (chunks.length >= 2) break;
    }
    if (chunks.length >= 2) break;
  }

  const text = [
    chunks.join("\n\n").slice(0, 5500),
    images.length ? `Candidate image URLs:\n${images.slice(0, 5).join("\n")}` : ""
  ]
    .filter(Boolean)
    .join("\n\n");

  return { text, images: images.slice(0, 5) };
}
