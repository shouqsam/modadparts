import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { SESSION_COOKIE, verifySessionToken } from "../../../../lib/auth";
import { addProductsBulk } from "../../../../lib/db";
import { rowsToProducts, worksheetToRows } from "../../../../lib/excel";

const MAX_ROWS = 5000;

export async function POST(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch (err) {
    const message = String(err?.message || "");
    if (/size|limit|body|large|413/i.test(message)) {
      return NextResponse.json(
        { error: "حجم الملف كبير جداً. حاول ملف أصغر أو قسّم المنتجات على أكثر من ملف." },
        { status: 413 }
      );
    }
    return NextResponse.json(
      { error: "تعذر استلام الملف. أعد تشغيل السيرفر ثم حاول مرة أخرى." },
      { status: 400 }
    );
  }

  const file = formData.get("file");
  if (!file || typeof file === "string" || typeof file.arrayBuffer !== "function") {
    return NextResponse.json({ error: "الرجاء اختيار ملف إكسل" }, { status: 400 });
  }

  if (file.size > 80 * 1024 * 1024) {
    return NextResponse.json(
      { error: "حجم الملف يتجاوز 80 ميجابايت. قسّم المنتجات على أكثر من ملف." },
      { status: 413 }
    );
  }

  const workbook = new ExcelJS.Workbook();
  try {
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(Buffer.from(arrayBuffer));
  } catch {
    return NextResponse.json(
      { error: "تعذر قراءة الملف. تأكد أنه بصيغة .xlsx (وليس .xls القديمة) وأن الأعمدة صحيحة." },
      { status: 400 }
    );
  }

  const worksheet = workbook.worksheets[0];
  if (!worksheet) {
    return NextResponse.json({ error: "الملف لا يحتوي على أي جدول بيانات" }, { status: 400 });
  }

  const rows = worksheetToRows(worksheet);
  if (rows.length === 0) {
    return NextResponse.json({ error: "الملف فارغ" }, { status: 400 });
  }
  if (rows.length > MAX_ROWS) {
    return NextResponse.json({ error: `عدد الصفوف كبير جداً (الحد الأقصى ${MAX_ROWS})` }, { status: 400 });
  }

  const { products, skipped, usedFallbackName } = rowsToProducts(rows);
  if (products.length === 0) {
    return NextResponse.json(
      {
        error: "الملف لا يحتوي على صفوف بيانات للاستيراد."
      },
      { status: 400 }
    );
  }

  const created = await addProductsBulk(products);
  return NextResponse.json({
    imported: created.length,
    skippedCount: skipped.length,
    skippedRows: skipped.slice(0, 30),
    usedFallbackNameCount: usedFallbackName?.length || 0
  });
}
