import StoreClient from "../components/StoreClient";
import { getProducts } from "../lib/db";
import { SITE_DESCRIPTION, SITE_NAME } from "../lib/site";

export const dynamic = "force-dynamic";

export const metadata = {
  title: {
    absolute: `${SITE_NAME} | قطع غيار سيارات أصلية في الرياض`
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: `${SITE_NAME} | قطع غيار سيارات أصلية في الرياض`,
    description: SITE_DESCRIPTION,
    url: "/"
  }
};

export default async function HomePage() {
  const products = await getProducts();
  return <StoreClient products={products} />;
}
