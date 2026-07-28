"use client";

import { useState, useEffect, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "next/navigation";

interface Category {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  discount?: number;
  image: string;
  categoryId: number;
  category: string;
  is_active?: number | boolean;
}

interface ProductCatalogProps {
  priceListUrl?: string;
}

export default function ProductCatalog({ priceListUrl = "" }: ProductCatalogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const { cartItems, addToCart, updateQuantity, removeFromCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
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

  const activeProducts = products.filter(p => p.is_active === 1 || p.is_active === true || p.is_active === undefined);

  const filteredProducts = activeFilter === "All"
    ? activeProducts
    : activeProducts.filter(p => p.category === activeFilter);

  // Group filtered products by category
  const groupedProducts = useMemo(() => {
    return categories
      .map((cat) => {
        const catProds = filteredProducts.filter((p) => p.categoryId === cat.id);
        return { ...cat, products: catProds };
      })
      .filter((group) => group.products.length > 0);
  }, [categories, filteredProducts]);

  const getCartQty = (productId: number) => {
    const item = cartItems.find((c) => c.id === productId);
    return item ? item.quantity : 0;
  };

  if (loading) {
    return (
      <section className="bg-white py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 animate-pulse">
          <div className="text-center mb-16">
            <div className="w-32 h-4 bg-gray-200 mx-auto rounded mb-3"></div>
            <div className="w-96 h-12 bg-gray-200 mx-auto rounded mb-4"></div>
            <div className="w-24 h-1.5 bg-gray-200 mx-auto rounded-full"></div>
          </div>
          <div className="flex overflow-x-auto pb-4 md:pb-0 justify-start md:justify-center gap-3 md:gap-5 mb-16">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-12 w-32 bg-gray-200 rounded-xl flex-shrink-0"></div>
            ))}
          </div>
          {/* Skeleton table rows */}
          <div className="space-y-4">
            <div className="h-14 bg-gray-200 rounded-xl w-full"></div>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-lg w-full"></div>
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
        <div className="mb-12 md:mb-16">
          {/* Mobile Dropdown View */}
          <div className="md:hidden px-2">
             <div className="relative">
                <select 
                   value={activeFilter}
                   onChange={(e) => setActiveFilter(e.target.value)}
                   className="w-full appearance-none bg-white border-2 border-festive-purple/20 text-festive-purple font-black uppercase tracking-widest text-sm rounded-2xl px-6 py-4 shadow-lg shadow-festive-purple/5 focus:outline-none focus:border-festive-purple focus:ring-4 focus:ring-festive-purple/10 transition-all"
                >
                   {filters.map((filter) => (
                     <option key={filter} value={filter}>{filter}</option>
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
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-8 py-3 rounded-xl text-sm font-black uppercase tracking-widest transition-all duration-300 border-2 cursor-pointer ${
                  activeFilter === filter
                    ? "bg-festive-purple text-white border-festive-purple shadow-[0_10px_20px_-10px_rgba(45,13,84,0.6)] scale-105"
                    : "bg-white text-festive-purple border-festive-purple/10 hover:border-festive-gold hover:shadow-md"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* ═══ Table View (Grouped by Category) ═══ */}
        {groupedProducts.length > 0 ? (
          <div className="space-y-10">
            {groupedProducts.map((group) => (
              <div key={group.id}>
                {/* ═══ Category Banner Header ═══ */}
                <div className="relative overflow-hidden rounded-t-2xl bg-gradient-to-r from-festive-purple via-[#3d1166] to-festive-purple px-5 md:px-8 py-4 md:py-5 flex items-center justify-between shadow-lg">
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'1.5\' fill=\'white\'/%3E%3C/svg%3E")', backgroundSize: '20px 20px'}} />
                  <div className="relative z-10 flex items-center gap-3">
                    <span className="text-2xl">🎇</span>
                    <h2 className="text-lg md:text-2xl font-black uppercase tracking-wider text-white drop-shadow-sm">
                      {group.name}
                    </h2>
                  </div>
                  <span className="relative z-10 shrink-0 bg-festive-gold/20 backdrop-blur-sm text-festive-gold text-[10px] md:text-xs font-black px-3 md:px-4 py-1.5 rounded-full uppercase tracking-widest border border-festive-gold/40 whitespace-nowrap">
                    {group.products.length} Items
                  </span>
                </div>

                {/* ═══ Table Header (Desktop Only) ═══ */}
                <div className="hidden md:grid md:grid-cols-[80px_1fr_140px_120px_130px] lg:grid-cols-[90px_1fr_150px_130px_150px] items-center gap-4 px-6 lg:px-8 py-3 bg-gray-50 border-x border-gray-200 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
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
                      <div key={prod.id} className={`transition-all duration-300 hover:bg-amber-50/50 ${!isLast ? 'border-b border-gray-100' : ''}`}>
                        
                        {/* --- MOBILE VIEW --- */}
                        <div className="md:hidden flex p-3 gap-3 relative">
                           {/* Discount Badge */}
                           {prod.originalPrice > prod.price && (
                             <div className="absolute top-2 left-2 z-10 scale-75 origin-top-left">
                               <span className="bg-gradient-to-r from-festive-red to-red-500 text-white font-black px-2 py-0.5 rounded-md text-[10px] tracking-wider shadow-sm">
                                 {prodDiscount}% OFF
                               </span>
                             </div>
                           )}
                           
                           {/* Image */}
                           <div className="w-[80px] h-[80px] rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center p-1 overflow-hidden shrink-0">
                             <img src={prod.image || "/assets/images/placeholder.png"} alt={prod.name} loading="lazy" className="w-full h-full object-contain" />
                           </div>

                           {/* Content */}
                           <div className="flex-1 flex flex-col justify-between py-0.5">
                              <div>
                                 <h4 className="font-black text-slate-800 text-[13px] leading-tight line-clamp-2">{prod.name}</h4>
                                 <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 block truncate max-w-full">{group.name}</span>
                              </div>
                              <div className="flex items-end justify-between mt-2">
                                 <div className="flex flex-col">
                                    {prod.originalPrice > prod.price && (
                                      <span className="text-[10px] text-slate-400 line-through font-bold">₹{prod.originalPrice.toLocaleString('en-IN')}</span>
                                    )}
                                    <span className="text-[14px] font-black text-festive-purple">₹{prod.price.toLocaleString('en-IN')}</span>
                                 </div>
                                 <div className="shrink-0 mr-1">
                                    {qty > 0 ? (
                                      <div className="flex items-center border-2 border-festive-purple/20 rounded-md overflow-hidden bg-white h-7 w-[75px]">
                                        <button onClick={() => updateQuantity(prod.id, qty - 1)} className="flex-1 h-full text-slate-600 active:scale-95 font-black flex items-center justify-center">−</button>
                                        <input 
                                          type="number" 
                                          value={qty} 
                                          onChange={(e) => {
                                            const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                            if (!isNaN(val) && val >= 0) updateQuantity(prod.id, val);
                                          }}
                                          className="w-8 h-full font-black text-slate-900 text-[11px] bg-gray-50 text-center border-x border-gray-200 outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        />
                                        <button onClick={() => updateQuantity(prod.id, qty + 1)} className="flex-1 h-full text-slate-600 active:scale-95 font-black flex items-center justify-center">+</button>
                                      </div>
                                    ) : (
                                      <button onClick={() => addToCart({ id: prod.id, name: prod.name, price: prod.price, originalPrice: prod.originalPrice, image: prod.image, category: group.name })} className="h-7 px-4 rounded-md bg-gradient-to-r from-festive-purple to-[#3d1166] text-white font-black uppercase text-[10px] tracking-wider active:scale-95 shadow-md flex items-center justify-center gap-1">
                                        <span className="text-[14px] leading-none mb-[1px]">+</span> Add
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
                            <img src={prod.image || "/assets/images/placeholder.png"} alt={prod.name} loading="lazy" decoding="async" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                          </div>

                          {/* Product Info */}
                          <div className="flex flex-col items-start justify-center gap-0.5">
                            <h4 className="font-black text-slate-800 text-[15px] leading-tight group-hover:text-festive-purple transition-colors line-clamp-2">{prod.name}</h4>
                            {prod.originalPrice > prod.price && (
                              <span className="inline-flex items-center gap-1 bg-festive-red/10 text-festive-red text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider mt-0.5">
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
                            <span className="text-xl font-black text-festive-purple text-right">₹{prod.price.toLocaleString('en-IN')}</span>
                          </div>

                          {/* Cart Actions */}
                          <div className="flex justify-center items-center gap-2">
                            {qty > 0 ? (
                              <>
                                <div className="flex items-center border-2 border-festive-purple/20 rounded-xl overflow-hidden bg-white shadow-sm flex-1 w-[110px] lg:w-[120px] h-9">
                                  <button onClick={() => updateQuantity(prod.id, qty - 1)} className="flex-1 w-8 h-full text-slate-600 hover:bg-red-50 hover:text-festive-red transition-all cursor-pointer font-black text-lg flex items-center justify-center">−</button>
                                  <input 
                                    type="number" 
                                    value={qty} 
                                    onChange={(e) => {
                                      const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                      if (!isNaN(val) && val >= 0) updateQuantity(prod.id, val);
                                    }}
                                    className="w-10 h-full font-black text-slate-900 text-base bg-gray-50 text-center border-x border-gray-200 outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                  />
                                  <button onClick={() => updateQuantity(prod.id, qty + 1)} className="flex-1 w-8 h-full text-slate-600 hover:bg-purple-50 hover:text-festive-purple transition-all cursor-pointer font-black text-lg flex items-center justify-center">+</button>
                                </div>
                                <button onClick={() => removeFromCart(prod.id)} title="Remove from cart" className="w-9 h-9 rounded-xl bg-festive-red border border-festive-red text-white flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 flex-shrink-0 shadow-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>
                                </button>
                              </>
                            ) : (
                              <button onClick={() => addToCart({ id: prod.id, name: prod.name, price: prod.price, originalPrice: prod.originalPrice, image: prod.image, category: group.name })} className="w-[130px] lg:w-[140px] h-9 rounded-xl bg-gradient-to-r from-festive-purple to-[#3d1166] hover:from-festive-gold hover:to-yellow-500 text-white hover:text-festive-purple font-black uppercase text-[11px] tracking-wider hover:scale-[1.03] transition-all cursor-pointer shadow-[0_4px_15px_rgba(48,13,79,0.3)] hover:shadow-[0_4px_15px_rgba(255,215,0,0.4)] flex items-center justify-center gap-1 border border-transparent">
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
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-32">
            <span className="text-6xl animate-bounce inline-block drop-shadow-md mb-4">🎆</span>
            <p className="text-xl italic font-medium">Wait for it... more sparkles coming soon!</p>
          </div>
        )}
      </div>
    </section>
  );
}
