import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDb();
    const body = await req.json();
    const { name, price, originalPrice, image, categoryId } = body;

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    // Validation
    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }
    if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
      return NextResponse.json({ error: "Valid price is required" }, { status: 400 });
    }
    if (originalPrice === undefined || isNaN(Number(originalPrice)) || Number(originalPrice) < 0) {
      return NextResponse.json({ error: "Valid original price is required" }, { status: 400 });
    }
    if (!image || image.trim() === "") {
      return NextResponse.json({ error: "Product image is required" }, { status: 400 });
    }
    if (!categoryId || isNaN(Number(categoryId))) {
      return NextResponse.json({ error: "Valid category is required" }, { status: 400 });
    }

    const result = await db.run(
      `UPDATE products 
       SET name = ?, price = ?, originalPrice = ?, image = ?, categoryId = ? 
       WHERE id = ?`,
      [
        name.trim(),
        Math.round(Number(price)),
        Math.round(Number(originalPrice)),
        image.trim(),
        Number(categoryId),
        productId
      ]
    );

    if (result.changes === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Fetch the updated product with its category
    const updatedProduct = await db.get(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.image, p.categoryId, c.name as category
      FROM products p
      JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [productId]);

    return NextResponse.json(updatedProduct);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = await getDb();

    const productId = parseInt(id);
    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const result = await db.run("DELETE FROM products WHERE id = ?", [productId]);

    if (result.changes === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
