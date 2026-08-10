"use client";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Banner from "./components/Banner";
import VideoGallery from "./components/VideoGallery";
import FireworkGallery from "./components/FireworkGallery";
import Footer from "./components/Footer";
import ProductCatalog from "./components/ProductCatalog";
import SafetyTips from "./components/SafetyTips";
import ContactSection from "./components/ContactSection";
import ContactFloatingButtons from "./components/ContactFloatingButtons";
import OurBrands from "./components/OurBrands";

export default function Home() {
  const [priceListUrl, setPriceListUrl] = useState("");
  const [bannerText, setBannerText] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");

  useEffect(() => {
    const fetchPriceList = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const res = await fetch(`${apiUrl}/api/settings/price-list`);
        if (res.ok) {
          const data = await res.json();
          let fetchedUrl = data.url || "";
          
          if (fetchedUrl.includes('localhost:5000') || fetchedUrl.includes('localhost:5001')) {
            try {
              const path = new URL(fetchedUrl).pathname;
              fetchedUrl = `${apiUrl}${path}`;
            } catch (e) {
              // ignore
            }
          }
          // Handle Mixed Content (http -> https)
          if (typeof window !== 'undefined' && window.location.protocol === 'https:' && fetchedUrl.startsWith('http://')) {
              fetchedUrl = fetchedUrl.replace('http://', 'https://');
          }
          
          setPriceListUrl(fetchedUrl);
        }
      } catch (e) {
        console.error("Error fetching price list:", e);
      }
    };
    const fetchBannerText = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const res = await fetch(`${apiUrl}/api/settings/banner-text/get`);
        if (res.ok) {
          const data = await res.json();
          setBannerText(data.text || "");
        }
      } catch (e) {
        console.error("Error fetching banner text:", e);
      }
    };
    const fetchMinOrderValue = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
        const res = await fetch(`${apiUrl}/api/settings/min-order-value/get`);
        if (res.ok) {
          const data = await res.json();
          setMinOrderValue(data.value || "");
        }
      } catch (e) {
        console.error("Error fetching min order value:", e);
      }
    };

    fetchPriceList();
    fetchBannerText();
    fetchMinOrderValue();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-['Outfit'] selection:bg-festive-gold selection:text-festive-purple">
      {bannerText && (
        <div className="bg-festive-purple text-white py-2 overflow-hidden whitespace-nowrap relative border-b border-festive-gold/30">
          <style>{`
            @keyframes marquee-lr {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(100vw); }
            }
            .animate-marquee-lr {
              display: inline-block;
              animation: marquee-lr 15s linear infinite;
            }
          `}</style>
          <div className="animate-marquee-lr font-bold tracking-wider text-sm md:text-base px-4">
            {bannerText}
          </div>
        </div>
      )}


      {/* NAVIGATION */}
      <Navbar priceListUrl={priceListUrl} />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <Banner priceListUrl={priceListUrl} />
        
        {/* MINIMUM ORDER VALUE BANNER */}
        {minOrderValue && Number(minOrderValue) > 0 && (
          <div className="bg-gradient-to-r from-festive-purple via-[#3d1166] to-festive-purple py-4 md:py-5 border-y-2 border-festive-gold relative overflow-hidden shadow-xl z-20">
            <div className="absolute inset-0 bg-[url('/assets/images/stars-pattern.png')] opacity-10 mix-blend-overlay"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-festive-gold rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-festive-gold rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
            
            <div className="container mx-auto px-1 flex flex-row items-center justify-center gap-1 sm:gap-4 relative z-10 text-center flex-wrap">
              <span className="text-lg sm:text-3xl animate-bounce shadow-festive-gold drop-shadow-lg">🎉</span>
              <h3 className="text-white font-black text-[12px] sm:text-xl md:text-2xl tracking-wide uppercase drop-shadow-md">
                <span className="hidden sm:inline">Minimum Order Value:</span>
                <span className="sm:hidden">Minimum Order:</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-festive-gold to-yellow-500 font-extrabold ml-1 text-[14px] sm:text-xl md:text-2xl">
                  ₹{Number(minOrderValue).toLocaleString('en-IN')}
                </span>
              </h3>
              <span className="text-lg sm:text-3xl animate-bounce shadow-festive-gold drop-shadow-lg" style={{animationDelay: '0.2s'}}>🎉</span>
            </div>
          </div>
        )}
        
        {/* PRODUCT CATALOG */}
        <ProductCatalog priceListUrl={priceListUrl} />


        {/* FIREWORK IMAGE GALLERY SECTION */}
        <FireworkGallery />
        {/* TRUST BADGES SECTION */}
        <section className="bg-festive-purple py-16 border-y-4 border-festive-gold relative overflow-hidden">
            {/* Background glowing effects */}
            <div className="absolute top-0 left-1/4 w-64 h-64 bg-festive-gold/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-festive-red/20 rounded-full blur-3xl"></div>

            <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 relative z-10">
                {[
                  { 
                    label: "Sivakasi Direct", 
                    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-festive-gold"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
                  },
                  { 
                    label: "100% Quality Tested", 
                    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-festive-gold"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" /></svg>
                  },
                  { 
                    label: "Wholesale Price", 
                    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-festive-gold"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                  },
                  { 
                    label: "Safe Delivery", 
                    icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-festive-gold"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
                  }
                ].map((item, index) => (
                  <div key={item.label} className="flex flex-col items-center gap-5 text-center group cursor-default">
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-festive-purple border border-festive-gold/40 shadow-[0_0_20px_rgba(255,215,0,0.15)] flex items-center justify-center group-hover:scale-110 group-hover:bg-festive-gold/10 group-hover:border-festive-gold group-hover:shadow-[0_0_30px_rgba(255,215,0,0.5)] transition-all duration-500 relative">
                          {/* Inner soft glow */}
                          <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
                          {item.icon}
                      </div>
                      <span className="text-white font-black uppercase text-xs md:text-sm tracking-[0.2em] group-hover:text-festive-gold transition-colors duration-300 leading-snug">{item.label}</span>
                  </div>
                ))}
            </div>
        </section>

        {/* BRAND INTRODUCTION SECTION (ABOUT US) */}
        <section id="about-us" className="bg-gradient-to-b from-white to-gray-50 py-16 md:py-24 overflow-hidden scroll-mt-24 relative">
            {/* Decorative ambient blobs for mobile & desktop */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-festive-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-festive-purple/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4"></div>

            <div className="container mx-auto px-5 md:px-8 flex flex-col md:flex-row items-center gap-10 md:gap-16 relative z-10">
                <div className="w-full md:w-1/2 flex justify-center">
                    <div className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[28rem] aspect-square rounded-3xl md:rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)] bg-white p-6 md:p-10 border border-gray-100 group transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)]">
                        <img 
                            src="/assets/images/vamsi_crackers_logo_v2.png" 
                            alt="Vamsi Crackers Logo" 
                            className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110 drop-shadow-sm"
                        />
                        <div className="absolute inset-0 border-2 border-festive-gold/10 rounded-3xl md:rounded-[2.5rem] pointer-events-none"></div>

                    </div>
                </div>
                
                <div className="w-full md:w-1/2 text-center md:text-left">
                    <div className="inline-flex items-center justify-center md:justify-start gap-2 px-4 py-2 rounded-full bg-festive-purple/5 border border-festive-purple/10 text-festive-purple font-black uppercase tracking-[0.2em] text-[10px] md:text-xs mb-5 md:mb-6 shadow-sm">
                        <span className="w-1.5 h-1.5 bg-festive-red rounded-full"></span>
                        About Vamsi Crackers
                    </div>
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-800 mb-5 md:mb-8 leading-[1.15] uppercase tracking-tighter">
                        Bringing The <span className="text-transparent bg-clip-text bg-gradient-to-r from-festive-red to-orange-500 drop-shadow-sm">Spark</span> <br />
                        To Your Celebrations
                    </h2>
                    
                    <div className="space-y-4 md:space-y-6 mb-8 md:mb-10 text-center md:text-left px-2 md:px-0">
                        <p className="text-gray-600 text-[15px] sm:text-base md:text-xl leading-relaxed font-medium">
                            Welcome to <strong className="text-slate-800">Vamsi Crackers</strong>, your premier destination for high-quality fireworks direct from the manufacturing capital of India—<strong className="text-festive-purple">Sivakasi</strong>. We are deeply committed to delivering joy, excitement, and the highest standards of safety in every box.
                        </p>
                        <p className="text-gray-500 text-[14px] sm:text-[15px] md:text-lg leading-relaxed">
                            Our curated collections range from traditional sparklers to grand sky shows, all tested for maximum safety and spectacular performance. We pride ourselves on offering wholesale prices directly to our customers, ensuring your festivals are both grand and affordable.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-6 md:mb-12">
                        {[
                            { title: "Direct From Sivakasi", sub: "Authentic Quality", icon: "🏭" },
                            { title: "Safety Certified", sub: "Child Safe Options", icon: "✅" },
                            { title: "Wholesale Price", sub: "Best In Market", icon: "💰" },
                            { title: "Pan India Delivery", sub: "Fast & Reliable", icon: "🚚" }
                        ].map((stat) => (
                            <div key={stat.title} className="bg-white rounded-2xl p-4 md:p-5 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 text-center md:text-left flex flex-col md:flex-row items-center gap-3 md:gap-4 group">
                                <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 bg-festive-gold/10 rounded-full flex items-center justify-center text-xl md:text-2xl group-hover:scale-110 group-hover:bg-festive-gold/20 transition-all duration-300">
                                    {stat.icon}
                                </div>
                                <div>
                                    <h4 className="text-slate-800 font-black text-[11px] sm:text-xs md:text-sm uppercase tracking-tight mb-0.5">{stat.title}</h4>
                                    <p className="text-gray-400 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">{stat.sub}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>


        {/* OUR BRANDS SECTION */}
        <OurBrands />

        {/* SAFETY TIPS SECTION */}
        <SafetyTips />

        {/* CONTACT SECTION */}
        <ContactSection />
      </main>

      {/* FOOTER */}
      <Footer />

      {/* FLOATING CONTACT BUTTONS */}
      <ContactFloatingButtons />

    </div>
  );
}
