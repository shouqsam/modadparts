import { NextResponse } from "next/server";
import ExcelJS from "exceljs";

export async function GET() {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("المنتجات");

  sheet.addRow(["الاسم", "رقم_القطعة", "الماركة", "الفئة", "السعر", "الكمية", "رابط_الصورة", "الوصف"]);
  sheet.addRow([
    "طرمبة بنزين نيسان صني",
    "17040-1HC0A",
    "نيسان",
    "كهرباء ومحركات",
    250,
    10,
    "https://example.com/image.jpg",
    "قطعة أصلية - ضمان 3 أشهر"
  ]);
  sheet.getRow(1).font = { bold: true };
  sheet.columns.forEach((col) => {
    col.width = 22;
  });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": "attachment; filename=products-template.xlsx"
    }
  });
}
