"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ContactFloatingButtons from "../components/ContactFloatingButtons";
import { useCart } from "../context/CartContext";

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
  discount: number;
  categoryName: string;
}

function ProductsPageInner() {
  const { cartItems, addToCart, updateQuantity, setCartOpen } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceListUrl, setPriceListUrl] = useState("");
  const hasScrolledRef = useRef(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [catsRes, prodsRes, plRes] = await Promise.all([
          fetch(`${apiUrl}/api/categories`),
          fetch(`${apiUrl}/api/products`),
          fetch(`${apiUrl}/api/settings/price-list`).catch(() => null),
        ]);

        if (catsRes.ok && prodsRes.ok) {
          const catsData = await catsRes.json();
          const prodsData = await prodsRes.json();
          setCategories(catsData);
          setProducts(prodsData);
        }

        if (plRes && plRes.ok) {
          const plData = await plRes.json();
          setPriceListUrl(plData.url || "");
        }
      } catch (e) {
        console.error("Error loading products catalogue:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [apiUrl]);

  // Auto-scroll to category when arriving from home page via ?scroll=category-sec-{id}
  const searchParams = useSearchParams();
  useEffect(() => {
    if (loading) return;                    // wait until products are in DOM
    if (hasScrolledRef.current) return;     // only scroll once per navigation
    const scrollTarget = searchParams.get("scroll");
    if (!scrollTarget) return;

    hasScrolledRef.current = true;

    // Retry up to 8 times (every 250ms = 2s total) until element is painted
    let attempts = 0;
    const tryScroll = () => {
      const el = document.getElementById(scrollTarget);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (attempts < 8) {
        attempts++;
        setTimeout(tryScroll, 250);
      }
    };
    setTimeout(tryScroll, 300);
  }, [loading, searchParams]);

  const getCartQty = (productId: number) => {
    const item = cartItems.find((c) => c.id === productId);
    return item ? item.quantity : 0;
  };

  const handleScrollToCategory = (catId: number) => {
    const el = document.getElementById(`category-sec-${catId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Filter products by search query
  const filteredProducts = React.useMemo(() => {
    if (!searchQuery) return products;
    return products.filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [products, searchQuery]);

  // Group filtered products by category
  const groupedProducts = React.useMemo(() => {
    return categories
      .map((cat) => {
        const catProds = filteredProducts.filter((p) => p.categoryId === cat.id);
        return {
          ...cat,
          products: catProds,
        };
      })
      .filter((group) => group.products.length > 0);
  }, [categories, filteredProducts]);

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-slate-800 flex flex-col font-['Outfit'] selection:bg-festive-gold/30 selection:text-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <Navbar priceListUrl={priceListUrl} />

      <main className="flex-grow pt-[120px] pb-20">
        {/* Premium Light Hero Section */}
        <section className="relative h-[380px] md:h-[460px] flex items-center justify-center bg-gradient-to-br from-amber-50/80 via-white to-red-50/80 overflow-hidden border-b border-gray-200 shadow-sm">
          {/* Subtle Decorative Elements */}
          <div className="absolute inset-0 bg-[url('/assets/images/pattern.png')] bg-repeat opacity-[0.03] pointer-events-none mix-blend-multiply"></div>
          <div className="absolute -top-[100px] -left-[100px] w-96 h-96 bg-festive-gold/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-[100px] -right-[100px] w-96 h-96 bg-festive-red/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="container mx-auto px-4 lg:px-8 relative z-10 text-center space-y-6 max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white border border-festive-gold/30 text-festive-purple text-xs font-black uppercase tracking-[0.2em] shadow-lg shadow-festive-gold/10">
              ✨ Sivakasi Direct Wholesale Shop ✨
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight text-festive-purple leading-tight drop-shadow-sm">
              Premium Crackers <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-festive-red to-orange-500 drop-shadow-md">Price List</span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed px-2">
              Purchase premium quality crackers directly from Sivakasi at factory wholesale rates. Simply select your items, adjust order quantities, and click checkout to securely submit your order.
            </p>
            {products.length > 0 && Math.max(...products.map(p => p.discount || 0)) > 0 && (
              <div className="inline-block px-5 py-2.5 bg-festive-red/5 border border-festive-red/20 rounded-xl text-xs md:text-sm font-black text-festive-red uppercase tracking-widest leading-normal shadow-sm">
                🎇 FESTIVE BUMPER OFFER: UP TO {Math.max(...products.map(p => p.discount || 0))}% DISCOUNT ON ALL ITEMS! 🎇
              </div>
            )}
          </div>
        </section>

        {/* Sticky Controls Panel (Frosted Glassmorphic Bar) */}
        <section className="sticky top-16 md:top-[72px] z-30 py-4 px-4 bg-[#fdfbf7]/80 backdrop-blur-md">
          <div className="w-full max-w-[95%] mx-auto bg-white/95 border border-gray-200 backdrop-blur-2xl rounded-2xl md:rounded-full py-3.5 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            {/* Search Input Container */}
            <div className="relative w-full md:w-80 group">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-festive-gold text-sm">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search crackers by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl md:rounded-full text-slate-800 placeholder-gray-400 focus:outline-none focus:border-festive-gold focus:ring-2 focus:ring-festive-gold/20 transition-all font-semibold shadow-inner group-hover:border-gray-300"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-festive-red text-sm cursor-pointer transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Quick Scroll Navigation */}
            {categories.length > 0 && (
              <div className="w-full md:w-auto flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg flex-shrink-0">
                  📂 QUICK NAV:
                </span>
                <div className="flex items-center gap-2">
                  {categories.map((cat) => (
                     <button
                       key={cat.id}
                       onClick={() => handleScrollToCategory(cat.id)}
                       className="px-4 py-2 rounded-xl md:rounded-full bg-white border border-gray-200 text-slate-600 text-xs font-black uppercase tracking-wider hover:bg-gradient-to-r hover:from-festive-gold hover:to-yellow-500 hover:text-white hover:border-transparent hover:scale-105 active:scale-95 hover:shadow-lg hover:shadow-festive-gold/30 transition-all cursor-pointer flex-shrink-0"
                     >
                       {cat.name}
                     </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Catalog Table Container */}
        <section className="w-full max-w-[95%] mx-auto px-4 lg:px-6 mt-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="w-9 h-9 border-4 border-festive-gold border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-black uppercase tracking-widest text-festive-gold animate-pulse">
                Loading products database...
              </span>
            </div>
          ) : groupedProducts.length === 0 ? (
            <div className="text-center py-28 space-y-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-xl mx-auto">
              <span className="text-6xl animate-bounce inline-block drop-shadow-md">🎆</span>
              <p className="text-base font-black uppercase tracking-widest text-slate-400">
                No matching crackers found
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-festive-gold to-yellow-400 text-festive-purple text-sm font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_8px_20px_rgba(255,215,0,0.4)]"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="space-y-20">
              {groupedProducts.map((group) => (
                <div
                  key={group.id}
                  id={`category-sec-${group.id}`}
                  className="scroll-mt-48 md:scroll-mt-40 space-y-6"
                >
                  {/* Category Section Header */}
                  <div className="flex items-center gap-4 pb-3 border-b-2 border-festive-gold/20">
                    <span className="text-2xl drop-shadow-sm">🎇</span>
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-wider text-festive-purple">
                      {group.name}
                    </h2>
                    <span className="text-[10px] font-black text-festive-purple bg-festive-gold/15 border border-festive-gold/30 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                      {group.products.length} Products
                    </span>
                  </div>

                  {/* Unified Responsive Card Grid View (Premium Light) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6">
                    {group.products.map((prod) => {
                      const qty = getCartQty(prod.id);
                      return (
                        <div
                          key={prod.id}
                          className="flex flex-col p-4 md:p-5 rounded-2xl border border-gray-100 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden group hover:border-festive-gold/40 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] transition-all duration-300"
                        >
                           {/* Discount Badge */}
                           {prod.originalPrice > prod.price && (
                             <div className="absolute top-3 right-3 z-10">
                               <span className="bg-gradient-to-r from-festive-red to-red-500 text-white font-black px-2.5 py-1 rounded-full text-[9px] tracking-widest shadow-md uppercase inline-flex items-center gap-1 border border-white/20">
                                 🔥 {prod.discount || Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100)}% OFF
                               </span>
                             </div>
                           )}
 
                           {/* Image Container */}
                           <div className="w-full h-44 md:h-48 rounded-xl border border-gray-100 bg-gray-50/50 flex items-center justify-center p-4 overflow-hidden mb-5 group-hover:bg-amber-50/30 transition-colors">
                             <img
                               src={prod.image || "/assets/images/placeholder.png"}
                               alt={prod.name}
                               loading="lazy"
                               decoding="async"
                               className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm"
                             />
                           </div>
 
                           {/* Details */}
                           <div className="flex-1 flex flex-col">
                             <span className="text-[9px] font-bold text-slate-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded uppercase tracking-widest self-start mb-2">
                               {group.name}
                             </span>
                             <h4 className="font-black text-slate-800 text-base md:text-[1.05rem] line-clamp-2 leading-snug mb-3 group-hover:text-festive-purple transition-colors">
                               {prod.name}
                             </h4>
 
                             <div className="mt-auto">
                               <div className="flex items-end gap-2.5 mb-5">
                                 <span className="text-2xl md:text-[1.6rem] font-black text-festive-purple drop-shadow-sm">
                                   ₹{prod.price}
                                 </span>
                                 {prod.originalPrice > prod.price && (
                                   <span className="text-sm text-slate-400 line-through font-bold pb-0.5">
                                     ₹{prod.originalPrice}
                                   </span>
                                 )}
                               </div>

                              {/* Cart Actions */}
                              <div className="border-t border-gray-100 pt-5 mt-2">
                                {qty > 0 ? (
                                  <div className="flex items-center justify-between border border-gray-200 rounded-xl overflow-hidden bg-gray-50 shadow-sm group-hover:border-festive-gold/50 transition-all h-11 md:h-12">
                                    <button
                                      onClick={() => updateQuantity(prod.id, qty - 1)}
                                      className="flex-1 h-full text-slate-600 hover:bg-gray-200 hover:text-festive-red active:scale-95 transition-all cursor-pointer font-black text-xl flex items-center justify-center"
                                    >
                                      −
                                    </button>
                                    <span className="px-5 h-full font-black text-slate-900 text-base md:text-lg bg-white flex items-center justify-center min-w-[3.5rem] border-x border-gray-200 shadow-inner">
                                      {qty}
                                    </span>
                                    <button
                                      onClick={() => updateQuantity(prod.id, qty + 1)}
                                      className="flex-1 h-full text-slate-600 hover:bg-gray-200 hover:text-festive-purple active:scale-95 transition-all cursor-pointer font-black text-xl flex items-center justify-center"
                                    >
                                      +
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() =>
                                      addToCart({
                                        id: prod.id,
                                        name: prod.name,
                                        price: prod.price,
                                        originalPrice: prod.originalPrice,
                                        image: prod.image,
                                        category: group.name,
                                      })
                                    }
                                    className="w-full h-11 md:h-12 rounded-xl bg-festive-red hover:bg-festive-gold text-white hover:text-festive-purple font-black uppercase text-xs md:text-sm tracking-widest hover:scale-[1.02] active:scale-95 transition-all cursor-pointer shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_10px_25px_rgba(255,215,0,0.4)] flex items-center justify-center gap-2 border border-transparent hover:border-festive-gold"
                                  >
                                    <span className="text-base">🛒</span> ADD TO CART
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Contact floating widgets */}
      <ContactFloatingButtons />
    </div>
  );
}
export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#fdfbf7]" />}>
      <ProductsPageInner />
    </Suspense>
  );
}
