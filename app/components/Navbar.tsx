"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "../context/CartContext";

interface NavbarProps {
    priceListUrl?: string;
}

export default function Navbar({ priceListUrl = "" }: NavbarProps) {
    const { cartCount, setCartOpen } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [daysLeft, setDaysLeft] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);

        // Simple Diwali Countdown (Mockup for Nov 1st)
        const diwaliDate = new Date("2026-11-01").getTime();
        const now = new Date().getTime();
        const diff = diwaliDate - now;
        setDaysLeft(Math.floor(diff / (1000 * 60 * 60 * 24)));

        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full max-w-[100vw] z-50 flex flex-col">
            {/* Top Bar (Reference from user image) */}
            <div className={`w-full bg-gradient-to-r from-festive-red via-red-600 to-festive-red text-white text-[10px] sm:text-xs font-bold tracking-widest uppercase relative overflow-hidden transition-all duration-500 ${scrolled ? 'h-0 py-0 opacity-0' : 'py-2 opacity-100'}`}>
                <div className="animate-marquee whitespace-nowrap drop-shadow-md">
                    Diwali sale is open now. Please buy early to get best discounts. {daysLeft > 0 ? <span className="text-festive-gold drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">★ ONLY {daysLeft} DAYS LEFT FOR DIWALI! ★</span> : "HAPPY DIWALI! "} +91 98941 16131, +91 98947 36131 &nbsp;&nbsp;&nbsp;&nbsp; Diwali sale is open now. Please buy early to get best discounts. {daysLeft > 0 ? <span className="text-festive-gold drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]">★ ONLY {daysLeft} DAYS LEFT FOR DIWALI! ★</span> : "HAPPY DIWALI! "} +91 98941 16131, +91 98947 36131
                </div>
            </div>

            <nav
                className={`w-full transition-all duration-500 relative bg-[#16052b]/95 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.6)] ${scrolled ? "py-1.5" : "py-2 md:py-3"}`}
            >
                {/* Ultra-premium glowing bottom border */}
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-festive-gold/60 to-transparent shadow-[0_0_15px_rgba(255,215,0,0.3)]"></div>
                
                <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between px-3 sm:px-4 lg:px-8 xl:px-12 2xl:px-16 relative z-10">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 sm:gap-4 group cursor-pointer w-auto">
                        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full overflow-visible border-2 border-festive-gold bg-gradient-to-br from-white/20 to-white/5 shadow-[0_0_30px_rgba(255,215,0,0.4)] backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_50px_rgba(255,215,0,0.8)] p-[2.5px] ring-2 ring-festive-gold/20 group-hover:ring-festive-gold/40">
                            <div className="relative w-full h-full rounded-full overflow-hidden bg-white shadow-inner">
                                <Image 
                                    src="/assets/images/sri_dhakshina_logo.jpg" 
                                    alt="Logo" 
                                    fill 
                                    className="object-contain object-center scale-110 p-1"
                                />
                            </div>
                        </div>
                        <div className="absolute left-1/2 -translate-x-1/2 xl:static xl:translate-x-0 flex flex-col text-center xl:text-left">
                            <h1 className="whitespace-nowrap text-sm sm:text-base lg:text-[1.3rem] 2xl:text-[1.4rem] font-black tracking-tight uppercase leading-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                Sri Dhakshina <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-[#fff2aa] to-festive-gold drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]">Crackers</span>
                            </h1>
                            <span className="whitespace-nowrap text-[9px] sm:text-[10px] tracking-[0.3em] uppercase font-black text-yellow-500 mt-0.5 block drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                                Sivakasi's Pride
                            </span>
                        </div>
                    </div>

                    {/* Center: Desktop Menu */}
                    <ul className="hidden xl:flex items-center gap-6 2xl:gap-10">
                        {[
                            { name: "Home", link: "/" },
                            { name: "Products", link: "/products" },
                            { name: "Safety Tips", link: "/#safety-tips" },
                            { name: "About Us", link: "/#about-us" },
                            { name: "Contact", link: "/#contact" }
                        ].map((item) => (
                            <li key={item.name} className="relative group flex flex-col items-center">
                                <a
                                    href={item.name === "Pricelist" && priceListUrl ? priceListUrl : item.link}
                                    target={item.name === "Pricelist" && priceListUrl ? "_blank" : undefined}
                                    rel={item.name === "Pricelist" && priceListUrl ? "noreferrer" : undefined}
                                    className="whitespace-nowrap text-[12px] 2xl:text-[13px] font-black uppercase tracking-[0.1em] transition-all duration-300 text-white hover:text-festive-gold drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.6)]"
                                >
                                    {item.name}
                                </a>
                                {/* Premium glowing dot on hover instead of line */}
                                <span className="absolute -bottom-3 w-1.5 h-1.5 rounded-full bg-festive-gold opacity-0 scale-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-[0_0_12px_rgba(255,215,0,1)]"></span>
                            </li>
                        ))}
                    </ul>

                    {/* Right: Actions */}
                    <div className="hidden xl:flex items-center gap-4 2xl:gap-6">
                        {/* Premium Cart Button */}
                        <button
                            onClick={() => setCartOpen(true)}
                            className="whitespace-nowrap relative flex items-center gap-2 px-5 py-2 rounded-full border border-festive-gold/50 bg-festive-gold/10 hover:bg-festive-gold/20 text-festive-gold transition-all duration-500 backdrop-blur-md shadow-[0_0_20px_rgba(255,215,0,0.15)] hover:shadow-[0_0_30px_rgba(255,215,0,0.3)] group cursor-pointer hover:scale-105"
                        >
                            <span className="text-lg group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300">🛒</span>
                            <span className="font-black text-xs uppercase tracking-widest text-white group-hover:text-festive-gold transition-colors">Cart</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-red-500 to-red-700 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.8)] border border-[#16052b] animate-bounce">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Sleek Contact Box with 2 Numbers */}
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-sm hover:bg-white/10 hover:border-festive-gold/30 transition-all duration-300 shadow-inner group">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-festive-gold/30 to-festive-gold/10 flex items-center justify-center text-festive-gold group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(255,215,0,0.2)] group-hover:shadow-[0_0_20px_rgba(255,215,0,0.4)]">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" /></svg>
                            </div>
                            <div className="flex flex-col">
                                <span className="whitespace-nowrap text-[9px] font-bold uppercase text-yellow-500/90 tracking-widest mb-0.5 drop-shadow-sm">Enquiry & Bulk</span>
                                <span className="whitespace-nowrap text-[11px] font-black leading-tight text-white tracking-wider drop-shadow-md">+91 98941 16131</span>
                                <span className="whitespace-nowrap text-[11px] font-black leading-tight text-white tracking-wider drop-shadow-md">+91 98947 36131</span>
                            </div>
                        </div>

                        {/* Ultra Premium Price List Button */}
                        <a 
                            href={priceListUrl || "#"}
                            target={priceListUrl ? "_blank" : undefined}
                            rel={priceListUrl ? "noreferrer" : undefined}
                            className="whitespace-nowrap relative overflow-hidden group px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-[0.15em] text-festive-purple bg-gradient-to-r from-festive-gold via-yellow-200 to-festive-gold bg-[length:200%_auto] hover:bg-[position:right_center] transition-all duration-500 shadow-[0_0_25px_rgba(255,215,0,0.5)] hover:shadow-[0_0_40px_rgba(255,215,0,0.8)] flex items-center gap-2 hover:scale-105"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <span className="text-lg group-hover:-translate-y-1 transition-transform duration-300 drop-shadow-sm">📥</span>
                                Price List
                            </span>
                        </a>
                    </div>

                    {/* Right Actions (Mobile) */}
                    <div className="flex items-center gap-4 xl:hidden">
                        {/* Mobile Cart Button */}
                        <button
                            onClick={() => setCartOpen(true)}
                            className="relative flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 text-white backdrop-blur-md"
                        >
                            <span className="text-base">🛒</span>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-festive-red to-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(220,38,38,0.5)]">
                                    {cartCount}
                                </span>
                            )}
                        </button>

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-white transition-colors"
                        >
                            <span className="text-lg">{isOpen ? "✕" : "☰"}</span>
                        </button>
                    </div>
                </div>

            </nav>

            {/* Mobile Menu Overlay */}
            <div
                className={`fixed inset-0 bg-[#120822]/98 backdrop-blur-3xl z-40 xl:hidden transition-all duration-500 ease-in-out ${isOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
            >
                <div className={`flex flex-col h-full items-center justify-center gap-8 pt-24 pb-10 overflow-y-auto transition-transform duration-700 ${isOpen ? "translate-y-0" : "translate-y-10"}`}>
                    {[
                        { name: "Home", link: "/" },
                        { name: "Products", link: "/products" },
                        { name: "Safety Tips", link: "/#safety-tips" },
                        { name: "About Us", link: "/#about-us" },
                        { name: "Contact", link: "/#contact" }
                    ].map((item) => (
                        <a
                            key={item.name}
                            href={item.name === "Pricelist" && priceListUrl ? priceListUrl : item.link}
                            target={item.name === "Pricelist" && priceListUrl ? "_blank" : undefined}
                            rel={item.name === "Pricelist" && priceListUrl ? "noreferrer" : undefined}
                            onClick={() => setIsOpen(false)}
                            className="text-2xl sm:text-3xl font-black text-white/70 uppercase tracking-widest hover:text-festive-gold hover:scale-110 transition-all duration-300"
                        >
                            {item.name}
                        </a>
                    ))}
                    <div className="mt-12 flex flex-col items-center gap-6 text-center w-full max-w-xs">
                         <div className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 p-5 rounded-3xl w-full">
                             <span className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-2">Direct Support</span>
                             <span className="text-white font-black text-xl tracking-wide">+91 98941 16131</span>
                             <span className="text-white font-black text-xl tracking-wide">+91 98947 36131</span>
                         </div>
                         <a 
                            href={priceListUrl || "#"}
                            target={priceListUrl ? "_blank" : undefined}
                            rel={priceListUrl ? "noreferrer" : undefined}
                            onClick={() => setIsOpen(false)}
                            className="w-full py-4 rounded-full font-black text-sm uppercase tracking-widest bg-gradient-to-r from-festive-gold to-yellow-400 text-festive-purple flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,215,0,0.3)] hover:scale-105 transition-transform duration-300"
                         >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M12 2.25a.75.75 0 01.75.75v11.69l3.22-3.22a.75.75 0 111.06 1.06l-4.5 4.5a.75.75 0 01-1.06 0l-4.5-4.5a.75.75 0 111.06-1.06l3.22 3.22V3a.75.75 0 01.75-.75zm-9 13.5a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" /></svg>
                            Download Price List
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
