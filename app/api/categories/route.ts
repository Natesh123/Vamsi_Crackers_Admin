import { NextResponse } from "next/server";
import { getDb } from "@/app/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const categories = await db.all("SELECT * FROM categories ORDER BY name ASC");
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const db = await getDb();
    const body = await req.json();
    const { name } = body;

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Category name is required" }, { status: 400 });
    }

    const result = await db.run("INSERT INTO categories (name) VALUES (?)", [name.trim()]);
    const newCategory = { id: result.lastID, name: name.trim() };

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    if (error.message.includes("UNIQUE constraint failed")) {
      return NextResponse.json({ error: "Category name already exists" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
