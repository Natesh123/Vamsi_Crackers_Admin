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
  is_active?: number | boolean;
  sort_order?: number;
}

function ProductsPageInner() {
  const { cartItems, addToCart, updateQuantity, removeFromCart, setCartOpen } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [priceListUrl, setPriceListUrl] = useState("");
  const hasScrolledRef = useRef(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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
          
          const removeTamil = (name: string) => name ? name.replace(/\s*\([^)]*[\u0b80-\u0bff]+[^)]*\)/g, "").trim() : name;
          
          setCategories(catsData.map((c: any) => ({ ...c, name: removeTamil(c.name) })));
          setProducts(prodsData.map((p: any) => ({ ...p, name: removeTamil(p.name) })));
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

  // Filter products by search query, active filter, and sort by sort_order
  const filteredProducts = React.useMemo(() => {
    let prods = products.filter(p => p.is_active === 1 || p.is_active === true || p.is_active === undefined);
    
    if (activeFilter !== "All") {
      prods = prods.filter(p => {
        const catName = p.categoryName || (p as any).category || '';
        return catName === activeFilter;
      });
    }

    if (searchQuery) {
      prods = prods.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return prods.sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
  }, [products, searchQuery, activeFilter]);

  const cleanStr = (str: string) => str ? str.replace(/\s*\([^)]*[\u0B80-\u0BFF]+[^)]*\)/g, '').trim() : '';

  // Deduplicate categories based on cleaned name
  const uniqueCategories = React.useMemo(() => {
    const seen = new Set<string>();
    return categories.filter(cat => {
      const cleanName = cleanStr(cat.name);
      if (seen.has(cleanName)) return false;
      seen.add(cleanName);
      return true;
    });
  }, [categories]);

  // Group filtered products by category sequentially
  const groupedProducts = React.useMemo(() => {
    const groups: { id: number | string; name: string; products: Product[] }[] = [];
    
    filteredProducts.forEach(prod => {
      // In app/products/page.tsx, category might be called categoryName
      const catName = prod.categoryName || (prod as any).category || '';
      const catId = prod.categoryId || catName;
      
      const existingGroup = groups.find(g => g.name === catName);
      if (existingGroup) {
        existingGroup.products.push(prod);
      } else {
        groups.push({ id: catId, name: catName, products: [prod] });
      }
    });
    
    return groups;
  }, [filteredProducts]);

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
            <span className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full bg-white border border-festive-gold/30 text-festive-purple text-xs font-semibold uppercase tracking-[0.2em] shadow-lg shadow-festive-gold/10">
              ✨ Sivakasi Direct Wholesale Shop ✨
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-semibold uppercase tracking-tight text-festive-purple leading-tight drop-shadow-sm">
              Premium Crackers <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-festive-red to-orange-500 drop-shadow-md">Price List</span>
            </h1>
            <p className="text-slate-600 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed px-2">
              Purchase premium quality crackers directly from Sivakasi at factory wholesale rates. Simply select your items, adjust order quantities, and click checkout to securely submit your order.
            </p>
            {products.length > 0 && Math.max(...products.map(p => p.discount || 0)) > 0 && (
              <div className="inline-block px-5 py-2.5 bg-festive-red/5 border border-festive-red/20 rounded-xl text-xs md:text-sm font-semibold text-festive-red uppercase tracking-widest leading-normal shadow-sm">
                🎇 FESTIVE BUMPER OFFER: UP TO {Math.max(...products.map(p => p.discount || 0))}% DISCOUNT ON ALL ITEMS! 🎇
              </div>
            )}
          </div>
        </section>

        {/* Sticky Controls Panel (Frosted Glassmorphic Bar) */}
        <section className="sticky top-16 md:top-[72px] z-30 py-4 px-4 bg-[#fdfbf7]/80 backdrop-blur-md">
          <div className="w-full max-w-[95%] mx-auto bg-white/95 border border-gray-200 backdrop-blur-2xl rounded-2xl md:rounded-full py-3.5 px-4 md:px-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
            {/* Search Input Container */}
            <div className="relative w-full group">
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
          </div>
        </section>

        {/* Catalog Table Container */}
        <section className="w-full max-w-[95%] mx-auto px-4 lg:px-6 mt-6">
          {/* Filters */}
          {uniqueCategories.length > 0 && (
            <div className="mb-12 md:mb-16">
              {/* Mobile Dropdown View */}
              <div className="md:hidden px-2">
                 <div className="relative">
                    <select 
                       value={activeFilter}
                       onChange={(e) => setActiveFilter(e.target.value)}
                       className="w-full appearance-none bg-white border-2 border-festive-purple/20 text-festive-purple font-semibold uppercase tracking-widest text-sm rounded-2xl px-6 py-4 shadow-lg shadow-festive-purple/5 focus:outline-none focus:border-festive-purple focus:ring-4 focus:ring-festive-purple/10 transition-all"
                    >
                       <option value="All">All Categories</option>
                       {uniqueCategories.map((cat) => (
                         <option key={cat.id} value={cat.name}>{cat.name}</option>
                       ))}
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-festive-purple">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                 </div>
              </div>

              {/* Desktop Buttons View */}
              <div className="hidden md:flex flex-wrap justify-center gap-4 px-4">
                <button
                  onClick={() => setActiveFilter("All")}
                  className={`px-8 py-3 rounded-xl text-sm font-semibold uppercase tracking-widest transition-all duration-300 border-2 cursor-pointer ${
                    activeFilter === "All"
                      ? "bg-festive-purple text-white border-festive-purple shadow-[0_10px_20px_-10px_rgba(45,13,84,0.6)] scale-105"
                      : "bg-white text-festive-purple border-festive-purple/10 hover:border-festive-gold hover:shadow-md"
                  }`}
                >
                  ALL
                </button>
                {uniqueCategories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveFilter(cat.name)}
                    className={`px-8 py-3 rounded-xl text-sm font-semibold uppercase tracking-widest transition-all duration-300 border-2 cursor-pointer ${
                      activeFilter === cat.name
                        ? "bg-festive-purple text-white border-festive-purple shadow-[0_10px_20px_-10px_rgba(45,13,84,0.6)] scale-105"
                        : "bg-white text-festive-purple border-festive-purple/10 hover:border-festive-gold hover:shadow-md"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-28 gap-4">
              <div className="w-9 h-9 border-4 border-festive-gold border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold uppercase tracking-widest text-festive-gold animate-pulse">
                Loading products database...
              </span>
            </div>
          ) : groupedProducts.length === 0 ? (
            <div className="text-center py-28 space-y-5 bg-white rounded-3xl border border-gray-100 shadow-sm p-8 max-w-xl mx-auto">
              <span className="text-6xl animate-bounce inline-block drop-shadow-md">🎆</span>
              <p className="text-base font-semibold uppercase tracking-widest text-slate-400">
                No matching crackers found
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-6 py-3 rounded-full bg-gradient-to-r from-festive-gold to-yellow-400 text-festive-purple text-sm font-semibold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-[0_8px_20px_rgba(255,215,0,0.4)]"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {groupedProducts.map((group) => {
                return (
                <div
                  key={group.id}
                  id={`category-sec-${group.id}`}
                  className="scroll-mt-48 md:scroll-mt-40"
                >
                  {/* Category Header */}
                  <div className="relative overflow-hidden bg-gradient-to-r from-[#1a0826] via-[#3d1166] to-[#1a0826] py-4 px-6 rounded-t-xl border-b-[3px] border-festive-gold shadow-[0_4px_20px_-5px_rgba(61,17,102,0.5)] flex items-center justify-center group">
                    <div className="absolute inset-0 opacity-20 bg-[url('/assets/images/pattern.png')] bg-repeat mix-blend-overlay pointer-events-none" />
                    
                    <div className="relative z-10 flex items-center gap-3">
                      <span className="text-lg md:text-xl opacity-80 group-hover:animate-ping">✨</span>
                      <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 via-festive-gold to-yellow-400 font-semibold text-[18px] md:text-[22px] uppercase tracking-[0.2em] drop-shadow-lg text-center">
                        {group.name}
                      </h2>
                      <span className="text-lg md:text-xl opacity-80 group-hover:animate-ping">✨</span>
                    </div>
                  </div>

                  {/* ═══ Table Header (Desktop Only) ═══ */}
                  <div className="hidden md:grid md:grid-cols-[80px_1fr_140px_120px_130px] lg:grid-cols-[90px_1fr_150px_130px_150px] items-center gap-4 px-6 lg:px-8 py-3.5 bg-gradient-to-r from-festive-purple via-[#3d1166] to-festive-purple text-[10.5px] font-semibold text-festive-gold uppercase tracking-[0.2em] shadow-md border-b-2 border-festive-gold/30">
                    <span className="text-center drop-shadow-sm">Image</span>
                    <span className="drop-shadow-sm">Product Name</span>
                    <span className="text-right drop-shadow-sm">MRP</span>
                    <span className="text-right drop-shadow-sm">Offer Price</span>
                    <span className="text-center drop-shadow-sm">Action</span>
                  </div>

                  {/* ═══ Product Rows ═══ */}
                  <div className="border border-gray-200 md:border-t-0 rounded-b-xl overflow-hidden bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
                    {group.products.map((prod, idx) => {
                      const qty = getCartQty(prod.id);
                      const prodDiscount = prod.discount || Math.round(((prod.originalPrice - prod.price) / prod.originalPrice) * 100);
                      const isLast = idx === group.products.length - 1;
                      const cleanName = prod.name ? prod.name.replace(/\s*\([^)]*[\u0B80-\u0BFF]+[^)]*\)/g, '').trim() : '';

                      return (
                        <div key={prod.id} className={`transition-all duration-300 hover:bg-amber-50/50 ${!isLast ? 'border-b border-gray-100' : ''}`}>
                            
                            {/* --- MOBILE VIEW --- */}
                            <div className="md:hidden flex p-3 gap-3 relative">
                               {/* Discount Badge */}
                               {prod.originalPrice > prod.price && (
                                 <div className="absolute top-2 left-2 z-10 scale-75 origin-top-left">
                                   <span className="bg-gradient-to-r from-festive-red to-red-500 text-white font-semibold px-2 py-0.5 rounded-md text-[10px] tracking-wider shadow-sm">
                                     {prodDiscount}% OFF
                                   </span>
                                 </div>
                               )}
                               
                               {/* Image */}
                               <div className="w-[85px] h-[85px] rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 overflow-hidden shrink-0 relative">
                                 <img src={prod.image || "/assets/images/placeholder.png"} alt={cleanName} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                               </div>

                               {/* Content */}
                               <div className="flex-1 flex flex-col justify-between py-0.5">
                                  <div>
                                     <div className="flex items-start gap-1">
                                     <h4 className="font-semibold text-slate-800 text-[14px] leading-tight line-clamp-2">{cleanName}</h4>
                                   </div>
                                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block truncate max-w-full">{group.name}</span>
                                  </div>
                                  <div className="flex items-end justify-between mt-2">
                                     <div className="flex flex-col">
                                        {prod.originalPrice > prod.price && (
                                          <span className="text-[10px] text-slate-400 line-through font-bold">₹{prod.originalPrice.toLocaleString('en-IN')}</span>
                                        )}
                                        <span className="text-[14px] font-semibold text-festive-purple">₹{prod.price.toLocaleString('en-IN')}</span>
                                     </div>
                                     <div className="shrink-0 mr-1">
                                        {qty > 0 ? (
                                          <div className="flex items-center border-2 border-festive-purple/20 rounded-md overflow-hidden bg-white h-8 w-[85px]">
                                            <button onClick={() => updateQuantity(prod.id, qty - 1)} className="flex-1 h-full text-slate-600 active:scale-95 font-semibold text-sm flex items-center justify-center">−</button>
                                            <input 
                                              type="number" 
                                              value={qty} 
                                              onChange={(e) => {
                                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                if (!isNaN(val) && val >= 0) updateQuantity(prod.id, val);
                                              }}
                                              className="w-9 h-full font-semibold text-slate-900 text-[12px] bg-gray-50 text-center border-x border-gray-200 outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                            />
                                            <button onClick={() => updateQuantity(prod.id, qty + 1)} className="flex-1 h-full text-slate-600 active:scale-95 font-semibold text-sm flex items-center justify-center">+</button>
                                          </div>
                                        ) : (
                                          <button onClick={() => addToCart({ id: prod.id, name: cleanName, price: prod.price, originalPrice: prod.originalPrice, image: prod.image, category: group.name })} className="h-8 px-5 rounded-md bg-gradient-to-r from-festive-purple to-[#3d1166] text-white font-semibold uppercase text-[11px] tracking-wider active:scale-95 shadow-md flex items-center justify-center gap-1.5">
                                            <span className="text-[15px] leading-none mb-[1px]">+</span> Add
                                          </button>
                                        )}
                                     </div>
                                  </div>
                               </div>
                            </div>

                            {/* --- DESKTOP VIEW --- */}
                            <div className="hidden md:grid group relative grid-cols-[80px_1fr_140px_120px_130px] lg:grid-cols-[90px_1fr_150px_130px_150px] items-center gap-4 px-6 lg:px-8 py-3.5">
                              {/* Product Image */}
                              <div className="w-[80px] lg:w-[90px] h-[70px] lg:h-[75px] rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1.5 overflow-hidden flex-shrink-0 group-hover:border-festive-gold/30 transition-all mx-auto">
                                <img src={prod.image || "/assets/images/placeholder.png"} alt={cleanName} loading="lazy" decoding="async" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                              </div>

                              {/* Product Info */}
                              <div className="flex flex-col items-start justify-center gap-0.5">
                                <h4 className="font-semibold text-slate-800 text-[15px] leading-tight group-hover:text-festive-purple transition-colors line-clamp-2">{cleanName}</h4>
                                {prod.originalPrice > prod.price && (
                                  <span className="inline-flex items-center gap-1 bg-festive-red/10 text-festive-red text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider mt-0.5">
                                    🔥 {prodDiscount}% OFF
                                  </span>
                                )}
                              </div>

                              {/* Original Price */}
                              <div className="flex flex-col items-end justify-center">
                                {prod.originalPrice > prod.price ? (
                                  <span className="text-base text-slate-400 line-through font-bold text-right">₹{prod.originalPrice.toLocaleString('en-IN')}</span>
                                ) : (
                                  <span className="text-base text-slate-400 font-bold text-right">—</span>
                                )}
                              </div>

                              {/* Sale Price */}
                              <div className="flex flex-col items-end justify-center">
                                <span className="text-xl font-semibold text-festive-purple text-right">₹{prod.price.toLocaleString('en-IN')}</span>
                              </div>

                              {/* Cart Actions */}
                              <div className="flex justify-center items-center gap-2">
                                {qty > 0 ? (
                                  <>
                                    <div className="flex items-center border-2 border-festive-purple/20 rounded-xl overflow-hidden bg-white shadow-sm flex-1 w-[110px] lg:w-[120px] h-9">
                                      <button onClick={() => updateQuantity(prod.id, qty - 1)} className="flex-1 w-8 h-full text-slate-600 hover:bg-red-50 hover:text-festive-red transition-all cursor-pointer font-semibold text-lg flex items-center justify-center">−</button>
                                      <input 
                                        type="number" 
                                        value={qty} 
                                        onChange={(e) => {
                                          const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                          if (!isNaN(val) && val >= 0) updateQuantity(prod.id, val);
                                        }}
                                        className="w-10 h-full font-semibold text-slate-900 text-base bg-gray-50 text-center border-x border-gray-200 outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                      />
                                      <button onClick={() => updateQuantity(prod.id, qty + 1)} className="flex-1 w-8 h-full text-slate-600 hover:bg-purple-50 hover:text-festive-purple transition-all cursor-pointer font-semibold text-lg flex items-center justify-center">+</button>
                                    </div>
                                    <button onClick={() => removeFromCart(prod.id)} title="Remove from cart" className="w-9 h-9 rounded-xl bg-festive-red border border-festive-red text-white flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 flex-shrink-0 shadow-sm">
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={() => addToCart({ id: prod.id, name: cleanName, price: prod.price, originalPrice: prod.originalPrice, image: prod.image, category: group.name })} className="w-[130px] lg:w-[140px] h-9 rounded-xl bg-gradient-to-r from-festive-purple to-[#3d1166] hover:from-festive-gold hover:to-yellow-500 text-white hover:text-festive-purple font-semibold uppercase text-[11px] tracking-wider hover:scale-[1.03] transition-all cursor-pointer shadow-[0_4px_15px_rgba(48,13,79,0.3)] hover:shadow-[0_4px_15px_rgba(255,215,0,0.4)] flex items-center justify-center gap-1 border border-transparent">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                                    <span>Add</span>
                                  </button>
                                )}
                              </div>
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
