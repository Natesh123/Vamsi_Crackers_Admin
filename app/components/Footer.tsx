'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <footer className="relative bg-festive-purple text-white pt-24 pb-12 overflow-hidden">
            {/* Decorative Overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-festive-gold to-transparent opacity-50"></div>
            
            <div className="container mx-auto px-6 lg:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* 1. Brand Section */}
                    <div className="space-y-8 lg:col-span-2 lg:pr-12">
                        <div className="flex flex-col gap-4">
                            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-festive-gold shadow-2xl bg-white p-2">
                                <Image 
                                    src="/assets/images/sri_dhakshina_logo.jpg" 
                                    alt="Logo" 
                                    fill 
                                    className="object-contain"
                                />
                            </div>
                            <div>
                                <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tighter">
                                    Sri Dhakshina <span className="block xl:inline text-festive-gold">Crackers</span>
                                </h2>
                                <p className="text-sm text-festive-gold font-bold tracking-[0.3em] uppercase opacity-80">Sivakasi's Finest</p>
                            </div>
                        </div>
                        <p className="text-gray-300 text-base leading-relaxed max-w-xs">
                            Bringing the magic of fireworks directly from the heart of Sivakasi to your doorstep. Quality, Safety, and Joy in every bang.
                        </p>
                    </div>



                    {/* 3. Quick Links */}
                    <div>
                        <h3 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-b-2 border-festive-red inline-block pb-1">Quick Links</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-gray-300 hover:text-festive-gold transition-colors font-bold text-base uppercase tracking-wide">
                                    Home
                                </Link>
                            </li>
                            <li>
                                <Link href="/products" className="text-gray-300 hover:text-festive-gold transition-colors font-bold text-base uppercase tracking-wide">
                                    Products
                                </Link>
                            </li>
                            <li>
                                <a href="#safety-tips" className="text-gray-300 hover:text-festive-gold transition-colors font-bold text-base uppercase tracking-wide">
                                    Safety Tips
                                </a>
                            </li>
                            <li>
                                <a href="#about-us" className="text-gray-300 hover:text-festive-gold transition-colors font-bold text-base uppercase tracking-wide">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#contact" className="text-gray-300 hover:text-festive-gold transition-colors font-bold text-base uppercase tracking-wide">
                                    Contact Us
                                </a>
                            </li>

                        </ul>
                    </div>

                    {/* 4. Official Address */}
                    <div>
                        <h3 className="text-xl font-black text-white mb-8 uppercase tracking-widest border-b-2 border-festive-red inline-block pb-1">Address</h3>
                        <ul className="space-y-8">
                            <li className="flex items-start gap-5 group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-[0_8px_20px_rgba(0,0,0,0.3)] group-hover:border-festive-gold/40 group-hover:bg-festive-gold/10 group-hover:-translate-y-1 transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-festive-gold">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col mt-0.5">
                                    <span className="text-white font-bold text-base tracking-wide leading-relaxed group-hover:text-festive-gold transition-colors duration-300">
                                        Kavulur Veeracheliapuram,<br />Sivakasi
                                    </span>
                                    <span className="text-gray-400 text-sm font-medium mt-1">
                                        Tamil Nadu 626005, India
                                    </span>
                                </div>
                            </li>
                            <li className="flex items-start gap-5 group cursor-pointer">
                                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-[0_8px_20px_rgba(0,0,0,0.3)] group-hover:border-festive-gold/40 group-hover:bg-festive-gold/10 group-hover:-translate-y-1 transition-all duration-300">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-festive-gold">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col gap-2 mt-0.5">
                                    <a href="tel:+919894116131" className="text-gray-300 text-lg font-black tracking-wider hover:text-festive-gold transition-colors flex items-center gap-2">
                                        +91 98941 16131
                                    </a>
                                    <a href="tel:+919894736131" className="text-gray-300 text-lg font-black tracking-wider hover:text-festive-gold transition-colors flex items-center gap-2">
                                        +91 98947 36131
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-[1px] bg-white/10 mb-10"></div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-gray-400 font-bold uppercase tracking-widest">
                    <p>© 2026 Sri Dhakshina Crackers. All rights reserved.</p>
                    <div className="flex gap-8">
                        {['Diwali 2026', 'Sivakasi Direct', 'Safe Fireworks'].map((link) => (
                            <span key={link} className="text-festive-gold/60">{link}</span>
                        ))}
                    </div>
                </div>
            </div>

            {/* Scroll to Top */}
            <button
                onClick={scrollToTop}
                className="absolute bottom-10 right-10 w-14 h-14 bg-festive-gold text-festive-purple rounded-full flex items-center justify-center shadow-2xl hover:-translate-y-2 transition-all group z-20"
            >
                <span className="text-2xl group-hover:scale-125 transition-transform">↑</span>
            </button>
        </footer>
    );
}
