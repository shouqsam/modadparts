import AdminDashboard from "../../components/AdminDashboard";
import { getProducts } from "../../lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const products = await getProducts();
  return <AdminDashboard initialProducts={products} />;
}
