import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const products = await db.all(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.image, p.categoryId, c.name as category
      FROM products p
      JOIN categories c ON p.categoryId = c.id
      ORDER BY p.id DESC
    `);
    return NextResponse.json(products);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const { name, price, originalPrice, image, categoryId } = body;

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

    // Insert
    const result = await db.run(
      `INSERT INTO products (name, price, originalPrice, image, categoryId) VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        Math.round(Number(price)),
        Math.round(Number(originalPrice)),
        image.trim(),
        Number(categoryId)
      ]
    );

    // Fetch the inserted product with its category
    const newProduct = await db.get(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.image, p.categoryId, c.name as category
      FROM products p
      JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [result.lastID]);

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
