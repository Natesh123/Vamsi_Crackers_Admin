"use client";

import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  categoryId: number;
  category: string;
}

interface ProductCatalogProps {
  priceListUrl?: string;
}

export default function ProductCatalog({ priceListUrl = "" }: ProductCatalogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    async function loadData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const [catsRes, prodsRes] = await Promise.all([
          fetch(`${apiUrl}/api/categories`),
          fetch(`${apiUrl}/api/products`)
        ]);

        if (catsRes.ok && prodsRes.ok) {
          const catsData = await catsRes.json();
          const prodsData = await prodsRes.json();
          setCategories(catsData);
          setProducts(prodsData);
        }
      } catch (error) {
        console.error("Error loading products:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const filters = ["All", ...categories.map(c => c.name)];

  const filteredProducts = activeFilter === "All"
    ? products
    : products.filter(p => p.category === activeFilter);

  if (loading) {
    return (
      <section className="bg-white py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 animate-pulse">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="w-32 h-4 bg-gray-200 mx-auto rounded mb-3"></div>
            <div className="w-96 h-12 bg-gray-200 mx-auto rounded mb-4"></div>
            <div className="w-24 h-1.5 bg-gray-200 mx-auto rounded-full"></div>
          </div>

          {/* Filters */}
          <div className="flex overflow-x-auto pb-4 md:pb-0 justify-start md:justify-center gap-3 md:gap-5 mb-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 w-32 bg-gray-200 rounded-xl flex-shrink-0"></div>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-6 h-[420px] flex flex-col gap-4">
                <div className="bg-gray-100 h-60 w-full rounded-xl"></div>
                <div className="h-3 bg-gray-200 w-1/4 rounded"></div>
                <div className="h-6 bg-gray-200 w-3/4 rounded"></div>
                <div className="h-12 bg-gray-200 w-full rounded-xl mt-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="pricelist" className="bg-white py-24 relative overflow-hidden scroll-mt-24">
      {/* Decorative Side Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-10 bg-festive-red rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 bg-festive-purple rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-festive-red text-base font-black tracking-[0.3em] uppercase mb-3 block">Our Products</span>
          <h2 className="text-4xl md:text-6xl font-black text-festive-purple mb-4">
            Explore Our <span className="text-festive-red">Crackers</span>
          </h2>
          <div className="w-24 h-1.5 bg-festive-gold mx-auto rounded-full mb-6"></div>
          {priceListUrl && (
            <div className="flex justify-center mt-2 animate-bounce">
              <a
                href={priceListUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-festive-gold text-festive-purple font-black text-base uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_20px_rgba(255,215,0,0.3)]"
              >
                📥 Download Full Price List (PDF)
              </a>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex overflow-x-auto pb-4 md:pb-0 scrollbar-hide md:flex-wrap justify-start md:justify-center gap-3 md:gap-5 mb-16 px-4 -mx-4">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-8 py-3 rounded-xl text-base font-black uppercase tracking-widest transition-all duration-300 border-2 flex-shrink-0 cursor-pointer ${
                activeFilter === filter
                  ? "bg-festive-purple text-white border-festive-purple shadow-xl scale-105"
                  : "bg-transparent text-festive-purple border-festive-purple/10 hover:border-festive-gold"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} id={product.id} name={product.name} price={product.price} originalPrice={product.originalPrice} image={product.image} category={product.category} categoryId={product.categoryId} />
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center text-gray-400 py-32 animate-slideDown">
            <p className="text-xl italic font-medium">Wait for it... more sparkles coming soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
