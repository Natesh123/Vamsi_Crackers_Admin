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

  useEffect(() => {
    const fetchPriceList = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
        const res = await fetch(`${apiUrl}/api/settings/price-list`);
        if (res.ok) {
          const data = await res.json();
          setPriceListUrl(data.url || "");
        }
      } catch (e) {
        console.error("Error fetching price list:", e);
      }
    };
    fetchPriceList();
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-['Outfit'] selection:bg-festive-gold selection:text-festive-purple">

      {/* NAVIGATION */}
      <Navbar priceListUrl={priceListUrl} />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <Banner priceListUrl={priceListUrl} />
        
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
        <section id="about-us" className="bg-gray-50 py-24 overflow-hidden scroll-mt-24">
            <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
                <div className="md:w-1/2 flex justify-center">
                    <div className="relative w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-[2.5rem] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.12)] bg-white p-10 border border-gray-100 group">
                        <img 
                            src="/assets/images/sri_dhakshina_logo.jpg" 
                            alt="Sri Dhakshina Crackers Logo" 
                            className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 border-2 border-festive-gold/10 rounded-[2.5rem] pointer-events-none"></div>
                        {/* Festive Badge */}
                        <div className="absolute top-6 right-6 bg-festive-red text-white text-xs font-black px-4 py-2 rounded-full shadow-lg animate-bounce">
                            SINCE 2024
                        </div>
                    </div>
                </div>
                <div className="md:w-1/2 text-center md:text-left">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-festive-red/10 text-festive-red font-black uppercase tracking-[0.2em] text-sm mb-6">
                        About Sri Dhakshina Crackers
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-festive-purple mb-8 leading-[1.1] uppercase tracking-tighter">
                        Bringing The <span className="text-festive-red">Spark</span> <br />
                        To Your Celebrations
                    </h2>
                    <p className="text-gray-600 text-lg md:text-xl mb-8 leading-relaxed font-medium">
                        Welcome to **Sri Dhakshina Crackers**, your premier destination for high-quality fireworks direct from the manufacturing capital of India—**Sivakasi**. We are deeply committed to delivering joy, excitement, and the highest standards of safety in every box.
                    </p>
                    <p className="text-gray-500 text-base md:text-lg mb-10 leading-relaxed">
                        Our curated collections range from traditional sparklers to grand sky shows, all tested for maximum safety and spectacular performance. We pride ourselves on offering wholesale prices directly to our customers, ensuring your festivals are both grand and affordable.
                    </p>
                    <div className="grid grid-cols-2 gap-6 mb-12">
                        {[
                            { title: "Direct From Sivakasi", sub: "Authentic Quality" },
                            { title: "Safety Certified", sub: "Child Safe Options" },
                            { title: "Wholesale Price", sub: "Best In Market" },
                            { title: "Pan India Delivery", sub: "Fast & Reliable" }
                        ].map((stat) => (
                            <div key={stat.title} className="border-l-4 border-festive-gold pl-4 text-left">
                                <h4 className="text-festive-purple font-black text-base uppercase tracking-tight">{stat.title}</h4>
                                <p className="text-gray-400 text-sm font-bold uppercase">{stat.sub}</p>
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
