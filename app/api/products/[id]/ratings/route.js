import { NextResponse } from "next/server";
import { addProductRating, getAverageRating, getProductById } from "../../../../../lib/db";

export async function GET(_request, { params }) {
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  return NextResponse.json({
    ratings: product.ratings,
    average: getAverageRating(product.ratings),
    count: product.ratings.length
  });
}

export async function POST(request, { params }) {
  const { id } = await params;
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح" }, { status: 400 });
  }

  const stars = Number(body?.stars);
  if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "اختر تقييماً من 1 إلى 5" }, { status: 400 });
  }

  const result = await addProductRating(id, {
    name: body?.name,
    stars,
    comment: body?.comment
  });

  if (!result) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  return NextResponse.json({
    rating: result.rating,
    product: result.product,
    average: getAverageRating(result.product.ratings)
  });
}
