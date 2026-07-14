import StoreClient from "../components/StoreClient";
import { getProducts } from "../lib/db";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await getProducts();
  return <StoreClient products={products} />;
}
