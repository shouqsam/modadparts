import { NextResponse } from "next/server";
import { deleteProductRating } from "../../../../../../../lib/db";

export async function DELETE(_request, { params }) {
  const { id, ratingId } = await params;
  const product = await deleteProductRating(id, ratingId);
  if (!product) {
    return NextResponse.json({ error: "التقييم غير موجود" }, { status: 404 });
  }
  return NextResponse.json({ product });
}
