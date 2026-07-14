import { notFound } from "next/navigation";
import ProductDetailClient from "../../../components/ProductDetailClient";
import { getProductById } from "../../../lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "منتج غير موجود" };
  return {
    title: `${product.name} | سلماكس قطع غيار التجارة`,
    description: product.description || `تفاصيل قطعة ${product.name}`
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  return <ProductDetailClient product={product} />;
}
