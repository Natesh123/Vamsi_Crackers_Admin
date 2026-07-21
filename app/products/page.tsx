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
  const { cartItems, addToCart, updateQuantity, removeFromCart, setCartOpen } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceListUrl, setPriceListUrl] = useState("");
  const hasScrolledRef = useRef(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
            <div className="space-y-10">
              {groupedProducts.map((group) => {
                const discountPct = group.products[0]?.discount || 
                  (group.products[0] ? Math.round(((group.products[0].originalPrice - group.products[0].price) / group.products[0].originalPrice) * 100) : 0);
                
                return (
                <div
                  key={group.id}
                  id={`category-sec-${group.id}`}
                  className="scroll-mt-48 md:scroll-mt-40"
                >
                  {/* ═══ Category Banner Header ═══ */}
                  <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-festive-purple via-[#3d1166] to-festive-purple px-5 md:px-8 py-4 md:py-5 flex items-center justify-between shadow-lg">
                    {/* Decorative pattern */}
                    <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'1.5\' fill=\'white\'/%3E%3C/svg%3E")', backgroundSize: '20px 20px'}} />
                    <div className="relative z-10 flex items-center gap-3">
                      <span className="text-2xl">🎇</span>
                      <h2 className="text-lg md:text-2xl font-black uppercase tracking-wider text-white drop-shadow-sm">
                        {group.name}
                      </h2>
                    </div>
                    <span className="relative z-10 bg-festive-gold/20 backdrop-blur-sm text-festive-gold text-[10px] md:text-xs font-black px-3 md:px-4 py-1.5 rounded-full uppercase tracking-widest border border-festive-gold/40">
                      {group.products.length} Items
                    </span>
                  </div>

                  {/* ═══ Table Header ═══ */}
                  <div className="grid grid-cols-[55px_1fr_45px_55px_85px] sm:grid-cols-[70px_1fr_80px_80px_110px] md:grid-cols-[80px_1fr_140px_120px_130px] lg:grid-cols-[90px_1fr_150px_130px_150px] items-center gap-1 sm:gap-2 md:gap-4 px-2 sm:px-4 md:px-6 lg:px-8 py-2 md:py-3 bg-gray-50 border-x border-gray-200 text-[8px] sm:text-[9px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest md:tracking-[0.2em]">
                    <span className="text-center">Image</span>
                    <span>Product Name</span>
                    <span className="text-right">MRP</span>
                    <span className="text-right">Offer Price</span>
                    <span className="text-center">Action</span>
                  </div>

                  {/* ═══ Product Rows ═══ */}
                  <div className="border border-gray-200 border-t-0 rounded-b-2xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                    {group.products.map((prod, idx) => {
                      const qty = getCartQty(prod.id);
                      const prodDiscount = prod.discount || Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
                      const isLast = idx === group.products.length - 1;

                      return (
                        <div
                          key={prod.id}
                          className={`group relative grid grid-cols-[55px_1fr_45px_55px_85px] sm:grid-cols-[70px_1fr_80px_80px_110px] md:grid-cols-[80px_1fr_140px_120px_130px] lg:grid-cols-[90px_1fr_150px_130px_150px] items-center gap-1 sm:gap-2 md:gap-4 px-2 sm:px-4 md:px-6 lg:px-8 py-3 md:py-3.5 transition-all duration-300 hover:bg-amber-50/50 ${!isLast ? 'border-b border-gray-100' : ''}`}
                        >
                          {/* Discount Badge - Mobile Only */}
                          {prod.originalPrice > prod.price && (
                            <div className="absolute top-1 left-1 md:hidden z-10 scale-[0.65] sm:scale-75 origin-top-left">
                              <span className="bg-gradient-to-r from-festive-red to-red-500 text-white font-black px-2 py-0.5 rounded-md text-[9px] tracking-wider shadow-sm">
                                {prodDiscount}% OFF
                              </span>
                            </div>
                          )}

                          {/* Product Image */}
                          <div className="w-[45px] h-[45px] sm:w-[60px] sm:h-[60px] md:w-[80px] lg:w-[90px] md:h-[70px] lg:h-[75px] rounded-md md:rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1 md:p-1.5 overflow-hidden flex-shrink-0 group-hover:border-festive-gold/30 transition-all mx-auto">
                            <img
                              src={prod.image || "/assets/images/placeholder.png"}
                              alt={prod.name}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="flex flex-col items-start justify-center gap-0.5">
                            <h4 className="font-black text-slate-800 text-[10px] sm:text-[12px] md:text-[15px] leading-tight group-hover:text-festive-purple transition-colors line-clamp-2">
                              {prod.name}
                            </h4>
                            {/* Mobile category tag */}
                            <span className="md:hidden text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block truncate max-w-full">
                              {group.name}
                            </span>
                            {/* Discount badge - Desktop */}
                            {prod.originalPrice > prod.price && (
                              <span className="hidden md:inline-flex items-center gap-1 bg-festive-red/10 text-festive-red text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider mt-0.5">
                                🔥 {prodDiscount}% OFF
                              </span>
                            )}
                          </div>

                          {/* Original Price (MRP) */}
                          <div className="flex flex-col items-end justify-center">
                            {prod.originalPrice > prod.price ? (
                              <span className="text-[9px] sm:text-[11px] md:text-base text-slate-400 line-through font-bold text-right">
                                ₹{prod.originalPrice.toLocaleString('en-IN')}
                              </span>
                            ) : (
                              <span className="text-[9px] sm:text-[11px] md:text-base text-slate-400 font-bold text-right">—</span>
                            )}
                          </div>

                          {/* Sale Price */}
                          <div className="flex flex-col items-end justify-center">
                            <span className="text-[11px] sm:text-[13px] md:text-xl font-black text-festive-purple text-right">
                              ₹{prod.price.toLocaleString('en-IN')}
                            </span>
                          </div>

                          {/* Cart Actions */}
                          <div className="flex justify-end md:justify-center items-center gap-1 md:gap-2">
                            {qty > 0 ? (
                              <>
                                <div className="flex items-center border-2 border-festive-purple/20 rounded-md md:rounded-xl overflow-hidden bg-white shadow-sm flex-1 w-[55px] sm:w-[70px] md:w-[110px] lg:w-[120px] h-6 sm:h-7 md:h-9">
                                  <button
                                    onClick={() => updateQuantity(prod.id, qty - 1)}
                                    className="flex-1 w-5 sm:w-6 md:w-8 h-full text-slate-600 hover:bg-red-50 hover:text-festive-red active:scale-95 transition-all cursor-pointer font-black text-xs sm:text-sm md:text-lg flex items-center justify-center"
                                  >
                                    −
                                  </button>
                                  <span className="w-5 sm:w-6 md:w-9 h-full font-black text-slate-900 text-[10px] sm:text-xs md:text-base bg-gray-50 flex items-center justify-center border-x border-gray-200">
                                    {qty}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(prod.id, qty + 1)}
                                    className="flex-1 w-5 sm:w-6 md:w-8 h-full text-slate-600 hover:bg-purple-50 hover:text-festive-purple active:scale-95 transition-all cursor-pointer font-black text-xs sm:text-sm md:text-lg flex items-center justify-center"
                                  >
                                    +
                                  </button>
                                </div>
                                <button
                                  onClick={() => removeFromCart(prod.id)}
                                  title="Remove from cart"
                                  className="w-6 h-6 sm:w-7 sm:h-7 md:w-9 md:h-9 rounded-md md:rounded-xl bg-red-50 border border-red-200 hover:bg-festive-red hover:border-festive-red text-festive-red hover:text-white flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 flex-shrink-0 shadow-sm"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 md:w-4 md:h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                  </svg>
                                </button>
                              </>
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
                                className="w-full md:w-[130px] lg:w-[140px] h-6 sm:h-7 md:h-9 rounded-md md:rounded-xl bg-gradient-to-r from-festive-purple to-[#3d1166] hover:from-festive-gold hover:to-yellow-500 text-white hover:text-festive-purple font-black uppercase text-[8px] sm:text-[9px] md:text-[11px] tracking-wider hover:scale-[1.03] active:scale-95 transition-all cursor-pointer shadow-[0_4px_15px_rgba(48,13,79,0.3)] hover:shadow-[0_4px_15px_rgba(255,215,0,0.4)] flex items-center justify-center gap-1 border border-transparent"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                <span className="hidden sm:inline">Add</span>
                                <span className="sm:hidden">Add</span>
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
              })}
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
