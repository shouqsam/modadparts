import { NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getProducts } from "../../../../lib/db";

export async function GET() {
  const products = await getProducts();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("المنتجات");
  sheet.addRow(["الاسم", "رقم_القطعة", "الماركة", "الفئة", "السعر", "الكمية", "رابط_الصورة", "الوصف"]);
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((col) => {
    col.width = 22;
  });

  for (const p of products) {
    const image = p.image && p.image.startsWith("data:") ? "" : p.image || "";
    sheet.addRow([
      p.name,
      p.partNumber || "",
      p.brand,
      p.category,
      p.price,
      p.quantity,
      image,
      p.description
    ]);
  }

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=products-backup.xlsx"
    }
  });
}
