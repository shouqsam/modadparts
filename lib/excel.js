const ALIASES = {
  name: [
    "name",
    "اسم",
    "الاسم",
    "اسم القطعة",
    "اسم المنتج",
    "اسم الصنف",
    "الصنف",
    "القطعة",
    "البيان",
    "العنوان",
    "وصف القطعة",
    "product",
    "product name",
    "part name",
    "item",
    "item name",
    "title",
    "designation"
  ],
  partNumber: [
    "partnumber",
    "part_number",
    "part number",
    "part no",
    "partno",
    "p/n",
    "pn",
    "sku",
    "oem",
    "oem number",
    "رقم القطعة",
    "رقم_القطعة",
    "رقم قطعة",
    "رقم الصنف",
    "الكود",
    "كود",
    "الكود الأصلي"
  ],
  brand: [
    "brand",
    "make",
    "manufacturer",
    "الماركة",
    "ماركة",
    "الشركة",
    "الشركة المصنعة",
    "الصانع",
    "المصنع"
  ],
  category: ["category", "الفئة", "النوع", "نوع القطعة", "التصنيف", "group"],
  price: ["price", "السعر", "سعر", "cost"],
  quantity: ["quantity", "qty", "الكمية", "كمية", "الكمية المتوفرة", "stock"],
  image: [
    "image",
    "image_url",
    "imageurl",
    "img",
    "رابط الصورة",
    "صورة",
    "الصورة",
    "رابط_الصورة",
    "photo"
  ],
  description: ["description", "وصف", "الوصف", "ملاحظات", "details", "note"]
};

function normalizeKey(key) {
  return String(key || "")
    .trim()
    .toLowerCase()
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ");
}

function toPlainValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    if ("text" in value) return value.text;
    if ("result" in value) return value.result;
    if ("hyperlink" in value) return value.hyperlink;
    if (value instanceof Date) return value.toISOString();
    // Excel rich text
    if (Array.isArray(value.richText)) {
      return value.richText.map((p) => p.text || "").join("");
    }
    return "";
  }
  return value;
}

function matchAlias(normalizedHeader, aliases) {
  return aliases.some((alias) => {
    const a = normalizeKey(alias);
    return normalizedHeader === a || normalizedHeader.includes(a) || a.includes(normalizedHeader);
  });
}

export function worksheetToRows(worksheet) {
  const headers = [];
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = String(toPlainValue(cell.value)).trim();
  });

  const rows = [];
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber];
      if (key) obj[key] = toPlainValue(cell.value);
    });
    if (Object.values(obj).some((v) => String(v).trim() !== "")) {
      rows.push({ rowNumber, data: obj });
    }
  });
  return rows;
}

export function mapExcelRow(row) {
  const entries = Object.entries(row).map(([k, v]) => [normalizeKey(k), v]);
  const result = {};
  for (const field of Object.keys(ALIASES)) {
    const match = entries.find(([k]) => matchAlias(k, ALIASES[field]));
    if (match && match[1] !== undefined && String(match[1]).trim() !== "") {
      result[field] = match[1];
    }
  }
  return result;
}

export function rowsToProducts(rows) {
  const products = [];
  const skipped = [];
  const usedFallbackName = [];

  rows.forEach(({ rowNumber, data }) => {
    const mapped = mapExcelRow(data);
    const hasAnyValue = Object.values(mapped).some((v) => String(v ?? "").trim() !== "");
    const rawValues = Object.values(data || {})
      .map((v) => String(v ?? "").trim())
      .filter(Boolean);
    const hasRawValue = rawValues.length > 0;
    if (!hasAnyValue && !hasRawValue) {
      skipped.push(rowNumber);
      return;
    }

    if (!hasAnyValue && hasRawValue) {
      mapped.name = rawValues[0];
      if (rawValues[1]) mapped.partNumber = rawValues[1];
      if (rawValues[2]) mapped.brand = rawValues[2];
      if (rawValues[3]) mapped.category = rawValues[3];
      if (rawValues[4] !== undefined) mapped.price = rawValues[4];
      if (rawValues[5] !== undefined) mapped.quantity = rawValues[5];
    }

    let name = String(mapped.name || "").trim();
    if (!name) {
      name =
        String(mapped.partNumber || "").trim() ||
        String(mapped.description || "").trim().slice(0, 120) ||
        String(mapped.brand || "").trim() ||
        rawValues[0] ||
        `منتج صف ${rowNumber}`;
      usedFallbackName.push(rowNumber);
    }

    products.push({
      ...mapped,
      name,
      brand: String(mapped.brand || "").trim() || "غير محدد",
      brands: String(mapped.brand || "").trim() || "غير محدد",
      category: String(mapped.category || "").trim(),
      categories: String(mapped.category || "").trim(),
      partNumber: String(mapped.partNumber || "").trim(),
      description: String(mapped.description || "").trim(),
      image: String(mapped.image || "").trim(),
      price: mapped.price ?? 0,
      quantity: mapped.quantity ?? 0
    });
  });

  return { products, skipped, usedPartNumberAsName: usedFallbackName, usedFallbackName };
}
