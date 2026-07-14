import { NextResponse } from "next/server";
import { toggleProductLike } from "../../../../../lib/db";

export async function POST(request, { params }) {
  const { id } = await params;
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const liked = body.action !== "unlike";
  const product = await toggleProductLike(id, liked);
  if (!product) {
    return NextResponse.json({ error: "المنتج غير موجود" }, { status: 404 });
  }

  return NextResponse.json({ likes: product.likes, product });
}
