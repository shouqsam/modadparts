import { notFound } from "next/navigation";
import ProductDetailClient from "../../../components/ProductDetailClient";
import { getProductById } from "../../../lib/db";
import { getProductBrands } from "../../../lib/productFields";
import { SITE_NAME, getSiteUrl } from "../../../lib/site";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) return { title: "منتج غير موجود" };

  const brands = getProductBrands(product).join("، ");
  const title = `${product.name}${product.partNumber ? ` ${product.partNumber}` : ""}`;
  const description =
    product.description ||
    `اشترِ ${product.name}${brands ? ` لـ ${brands}` : ""} من ${SITE_NAME} — قطع غيار سيارات أصلية في الرياض مع توصيل لجميع مناطق المملكة.`;
  const url = `/product/${product.id}`;
  const image = product.image && !String(product.image).startsWith("data:") ? product.image : "/logo.png";

  return {
    title,
    description,
    keywords: [
      product.name,
      product.partNumber,
      ...getProductBrands(product),
      "قطع غيار سيارات",
      "قطع غيار أصلية",
      SITE_NAME
    ].filter(Boolean),
    alternates: {
      canonical: url
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      type: "website",
      images: [{ url: image, alt: product.name }]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image]
    }
  };
}

function buildProductJsonLd(product) {
  const siteUrl = getSiteUrl();
  const brands = getProductBrands(product);
  const available = Number(product.quantity) > 0;
  const image =
    product.image && !String(product.image).startsWith("data:")
      ? product.image.startsWith("http")
        ? product.image
        : `${siteUrl}${product.image}`
      : `${siteUrl}/logo.png`;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || product.name,
    sku: product.partNumber || product.id,
    mpn: product.partNumber || undefined,
    image,
    brand: brands.map((brand) => ({ "@type": "Brand", name: brand })),
    offers: {
      "@type": "Offer",
      url: `${siteUrl}/product/${product.id}`,
      priceCurrency: "SAR",
      price: Number(product.price) || 0,
      availability: available
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "AutoPartsStore",
        name: SITE_NAME
      }
    }
  };
}

export default async function ProductPage({ params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();

  const jsonLd = buildProductJsonLd(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />
    </>
  );
}
