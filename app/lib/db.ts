import sqlite3 from "sqlite3";
import { open, Database } from "sqlite";
import path from "path";

// Prevent multiple connection pools in development due to hot-reloads
declare global {
  var sqliteDb: Database | undefined;
}

export async function getDb(): Promise<Database> {
  if (global.sqliteDb) {
    return global.sqliteDb;
  }

  const dbPath = path.resolve(process.cwd(), "crackers.db");

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // Enable foreign keys
  await db.run("PRAGMA foreign_keys = ON");

  // Create tables if they do not exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL,
      originalPrice INTEGER NOT NULL,
      image TEXT NOT NULL,
      categoryId INTEGER NOT NULL,
      FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE CASCADE
    );
  `);

  // Seed default data if categories table is empty
  const categoryCount = await db.get<{ count: number }>("SELECT COUNT(*) as count FROM categories");
  
  if (categoryCount && categoryCount.count === 0) {
    const defaultFilters = ["Sparklers", "Flower Pots", "Ground Chakkars", "Rockets", "Sky Shots", "Garlands"];
    const categoryIds: { [key: string]: number } = {};

    for (const filter of defaultFilters) {
      const result = await db.run("INSERT INTO categories (name) VALUES (?)", filter);
      categoryIds[filter] = result.lastID!;
    }

    const defaultProducts = [
      { name: "7cm Electric Sparklers", category: "Sparklers", price: 120, originalPrice: 250, image: "/assets/images/products/sparklers.png" },
      { name: "10cm Green Sparklers", category: "Sparklers", price: 150, originalPrice: 300, image: "/assets/images/products/sparklers.png" },
      { name: "12cm Red Sparklers", category: "Sparklers", price: 180, originalPrice: 350, image: "/assets/images/products/sparklers.png" },
      { name: "Flower Pot Small", category: "Flower Pots", price: 200, originalPrice: 400, image: "/assets/images/products/flower_pots.png" },
      { name: "Flower Pot Big", category: "Flower Pots", price: 350, originalPrice: 700, image: "/assets/images/products/flower_pots.png" },
      { name: "Flower Pot Special", category: "Flower Pots", price: 500, originalPrice: 900, image: "/assets/images/products/flower_pots.png" },
      { name: "Ground Chakkar Big", category: "Ground Chakkars", price: 220, originalPrice: 450, image: "/assets/images/products/ground_chakkars.png" },
      { name: "Chakkar Deluxe", category: "Ground Chakkars", price: 300, originalPrice: 600, image: "/assets/images/products/ground_chakkars.png" },
      { name: "Spinner Special", category: "Ground Chakkars", price: 380, originalPrice: 750, image: "/assets/images/products/ground_chakkars.png" },
      { name: "Baby Rocket", category: "Rockets", price: 150, originalPrice: 300, image: "/assets/images/products/rockets.png" },
      { name: "Lunik Rocket", category: "Rockets", price: 450, originalPrice: 900, image: "/assets/images/products/rockets.png" },
      { name: "12 Shot Skyout", category: "Sky Shots", price: 850, originalPrice: 1700, image: "/assets/images/products/sky_shots.png" },
      { name: "30 Shot Multi Color", category: "Sky Shots", price: 2500, originalPrice: 5000, image: "/assets/images/products/sky_shots.png" },
      { name: "240 Shot Mega Show", category: "Sky Shots", price: 12000, originalPrice: 24000, image: "/assets/images/products/sky_shots.png" },
      { name: "1000 Wala", category: "Garlands", price: 600, originalPrice: 1200, image: "/assets/images/products/garlands.png" },
      { name: "5000 Wala Giant", category: "Garlands", price: 3500, originalPrice: 7000, image: "/assets/images/products/garlands.png" }
    ];

    for (const prod of defaultProducts) {
      const catId = categoryIds[prod.category];
      if (catId) {
        await db.run(
          "INSERT INTO products (name, price, originalPrice, image, categoryId) VALUES (?, ?, ?, ?, ?)",
          [prod.name, prod.price, prod.originalPrice, prod.image, catId]
        );
      }
    }
  }

  global.sqliteDb = db;
  return db;
}
