/** Shared helpers for multi brand / category support. */

export const KNOWN_BRANDS = ["نيسان", "إنفينيتي", "رينو"];

export const KNOWN_CATEGORIES = [
  "محرك",
  "كهرباء",
  "فرامل",
  "تبريد",
  "تعليق",
  "هيكل وصالون",
  "زيوت وفلاتر",
  "قير ودفرنش"
];

export function toStringList(value) {
  if (Array.isArray(value)) {
    return uniquePreserveOrder(value.map((v) => String(v ?? "").trim()).filter(Boolean));
  }
  if (value == null) return [];
  const text = String(value).trim();
  if (!text) return [];
  return uniquePreserveOrder(
    text
      .split(/[,،;/|]+/)
      .map((v) => v.trim())
      .filter(Boolean)
  );
}

function uniquePreserveOrder(items) {
  const seen = new Set();
  const out = [];
  for (const item of items) {
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}

export function getProductBrands(product) {
  if (!product) return [];
  if (Array.isArray(product.brands) && product.brands.length) return toStringList(product.brands);
  return toStringList(product.brand);
}

export function getProductCategories(product) {
  if (!product) return [];
  if (Array.isArray(product.categories) && product.categories.length) return toStringList(product.categories);
  return toStringList(product.category);
}

export function formatList(values, separator = "، ") {
  return toStringList(values).join(separator);
}

export function productHasBrand(product, brand) {
  if (!brand || brand === "الكل") return true;
  return getProductBrands(product).some((b) => b === brand);
}
