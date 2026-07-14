export const WHATSAPP_NUMBER = "966502276206";
export const WHATSAPP_DISPLAY = "+966 50 227 6206";

export function buildWhatsappLink(message) {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`;
}

export function productInquiryMessage(product) {
  const lines = [
    "مرحباً، أستفسر عن القطعة التالية:",
    `الاسم: ${product.name}`
  ];
  if (product.partNumber) lines.push(`رقم القطعة: ${product.partNumber}`);
  const brands = Array.isArray(product.brands)
    ? product.brands.join("، ")
    : product.brand;
  if (brands) lines.push(`الماركة: ${brands}`);
  const categories = Array.isArray(product.categories)
    ? product.categories.join("، ")
    : product.category;
  if (categories) lines.push(`الفئة: ${categories}`);
  if (product.price) lines.push(`السعر المعروض: ${product.price} ريال`);
  return lines.join("\n");
}

export const GENERAL_INQUIRY_MESSAGE = "مرحباً، أرغب بالاستفسار عن قطع غيار متوفرة لديكم.";
