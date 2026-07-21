module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/sqlite3 [external] (sqlite3, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("sqlite3", () => require("sqlite3"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/app/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "getDb",
    ()=>getDb
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$sqlite3__$5b$external$5d$__$28$sqlite3$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/sqlite3 [external] (sqlite3, cjs)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sqlite$2f$build$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/sqlite/build/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
;
async function getDb() {
    if (global.sqliteDb) {
        return global.sqliteDb;
    }
    const dbPath = __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["default"].resolve(process.cwd(), "crackers.db");
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sqlite$2f$build$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["open"])({
        filename: dbPath,
        driver: __TURBOPACK__imported__module__$5b$externals$5d2f$sqlite3__$5b$external$5d$__$28$sqlite3$2c$__cjs$29$__["default"].Database
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
    const categoryCount = await db.get("SELECT COUNT(*) as count FROM categories");
    if (categoryCount && categoryCount.count === 0) {
        const defaultFilters = [
            "Sparklers",
            "Flower Pots",
            "Ground Chakkars",
            "Rockets",
            "Sky Shots",
            "Garlands"
        ];
        const categoryIds = {};
        for (const filter of defaultFilters){
            const result = await db.run("INSERT INTO categories (name) VALUES (?)", filter);
            categoryIds[filter] = result.lastID;
        }
        const defaultProducts = [
            {
                name: "7cm Electric Sparklers",
                category: "Sparklers",
                price: 120,
                originalPrice: 250,
                image: "/assets/images/products/sparklers.png"
            },
            {
                name: "10cm Green Sparklers",
                category: "Sparklers",
                price: 150,
                originalPrice: 300,
                image: "/assets/images/products/sparklers.png"
            },
            {
                name: "12cm Red Sparklers",
                category: "Sparklers",
                price: 180,
                originalPrice: 350,
                image: "/assets/images/products/sparklers.png"
            },
            {
                name: "Flower Pot Small",
                category: "Flower Pots",
                price: 200,
                originalPrice: 400,
                image: "/assets/images/products/flower_pots.png"
            },
            {
                name: "Flower Pot Big",
                category: "Flower Pots",
                price: 350,
                originalPrice: 700,
                image: "/assets/images/products/flower_pots.png"
            },
            {
                name: "Flower Pot Special",
                category: "Flower Pots",
                price: 500,
                originalPrice: 900,
                image: "/assets/images/products/flower_pots.png"
            },
            {
                name: "Ground Chakkar Big",
                category: "Ground Chakkars",
                price: 220,
                originalPrice: 450,
                image: "/assets/images/products/ground_chakkars.png"
            },
            {
                name: "Chakkar Deluxe",
                category: "Ground Chakkars",
                price: 300,
                originalPrice: 600,
                image: "/assets/images/products/ground_chakkars.png"
            },
            {
                name: "Spinner Special",
                category: "Ground Chakkars",
                price: 380,
                originalPrice: 750,
                image: "/assets/images/products/ground_chakkars.png"
            },
            {
                name: "Baby Rocket",
                category: "Rockets",
                price: 150,
                originalPrice: 300,
                image: "/assets/images/products/rockets.png"
            },
            {
                name: "Lunik Rocket",
                category: "Rockets",
                price: 450,
                originalPrice: 900,
                image: "/assets/images/products/rockets.png"
            },
            {
                name: "12 Shot Skyout",
                category: "Sky Shots",
                price: 850,
                originalPrice: 1700,
                image: "/assets/images/products/sky_shots.png"
            },
            {
                name: "30 Shot Multi Color",
                category: "Sky Shots",
                price: 2500,
                originalPrice: 5000,
                image: "/assets/images/products/sky_shots.png"
            },
            {
                name: "240 Shot Mega Show",
                category: "Sky Shots",
                price: 12000,
                originalPrice: 24000,
                image: "/assets/images/products/sky_shots.png"
            },
            {
                name: "1000 Wala",
                category: "Garlands",
                price: 600,
                originalPrice: 1200,
                image: "/assets/images/products/garlands.png"
            },
            {
                name: "5000 Wala Giant",
                category: "Garlands",
                price: 3500,
                originalPrice: 7000,
                image: "/assets/images/products/garlands.png"
            }
        ];
        for (const prod of defaultProducts){
            const catId = categoryIds[prod.category];
            if (catId) {
                await db.run("INSERT INTO products (name, price, originalPrice, image, categoryId) VALUES (?, ?, ?, ?, ?)", [
                    prod.name,
                    prod.price,
                    prod.originalPrice,
                    prod.image,
                    catId
                ]);
            }
        }
    }
    global.sqliteDb = db;
    return db;
}
}),
"[project]/app/api/products/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/lib/db.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])();
        const products = await db.all(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.image, p.categoryId, c.name as category
      FROM products p
      JOIN categories c ON p.categoryId = c.id
      ORDER BY p.id DESC
    `);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(products);
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
async function POST(req) {
    try {
        const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getDb"])();
        const body = await req.json();
        const { name, price, originalPrice, image, categoryId } = body;
        // Validation
        if (!name || name.trim() === "") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Product name is required"
            }, {
                status: 400
            });
        }
        if (price === undefined || isNaN(Number(price)) || Number(price) < 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Valid price is required"
            }, {
                status: 400
            });
        }
        if (originalPrice === undefined || isNaN(Number(originalPrice)) || Number(originalPrice) < 0) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Valid original price is required"
            }, {
                status: 400
            });
        }
        if (!image || image.trim() === "") {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Product image is required"
            }, {
                status: 400
            });
        }
        if (!categoryId || isNaN(Number(categoryId))) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: "Valid category is required"
            }, {
                status: 400
            });
        }
        // Insert
        const result = await db.run(`INSERT INTO products (name, price, originalPrice, image, categoryId) VALUES (?, ?, ?, ?, ?)`, [
            name.trim(),
            Math.round(Number(price)),
            Math.round(Number(originalPrice)),
            image.trim(),
            Number(categoryId)
        ]);
        // Fetch the inserted product with its category
        const newProduct = await db.get(`
      SELECT p.id, p.name, p.price, p.originalPrice, p.image, p.categoryId, c.name as category
      FROM products p
      JOIN categories c ON p.categoryId = c.id
      WHERE p.id = ?
    `, [
            result.lastID
        ]);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(newProduct, {
            status: 201
        });
    } catch (error) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error.message
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__925b16f2._.js.map