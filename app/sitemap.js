import { getProducts } from "../lib/db";
import { getSiteUrl } from "../lib/site";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const siteUrl = getSiteUrl();
  const products = await getProducts();
  const now = new Date();

  const productEntries = products.map((product) => ({
    url: `${siteUrl}/product/${product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
    changeFrequency: "weekly",
    priority: 0.7
  }));

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1
    },
    ...productEntries
  ];
}
