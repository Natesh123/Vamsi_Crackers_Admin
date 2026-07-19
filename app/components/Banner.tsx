'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const bannerImages = [
    '/assets/images/festive/banner_red.png',
];

interface BannerProps {
    priceListUrl?: string;
}

export default function Banner({ priceListUrl = "" }: BannerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
        }, 8000);
        return () => clearInterval(slideInterval);
    }, []);

    return (
        <div className="relative w-full h-[85vh] md:h-[90vh] overflow-hidden bg-black mt-20 md:mt-28">
            {/* Background Slides */}
            <div className="absolute inset-0 w-full h-full">
                {bannerImages.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        <Image
                            src={src}
                            alt="Festive Banner"
                            fill
                            className={`object-cover transition-transform duration-[12000ms] ease-out ${currentSlide === index ? 'scale-110' : 'scale-100'}`}
                            priority={index === 0}
                        />
                        <div className="absolute inset-0 bg-black/30"></div>
                    </div>
                ))}
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 z-20 flex items-center">
                <div className="container mx-auto px-4 lg:px-12 flex flex-col justify-center items-center md:items-start text-center md:text-left h-full">
                    <div className="animate-slideDown max-w-4xl flex flex-col items-center md:items-start">
                         {/* Badge */}
                         <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-festive-red text-white mb-6 animate-sparkle shadow-lg">
                            <span className="text-sm font-black tracking-widest uppercase">Premium Sivakasi Crackers</span>
                        </div>

                        <h2 className="text-white text-xl md:text-2xl font-bold mb-2 tracking-wide font-['Outfit']">
                            Welcome To
                        </h2>
                        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black mb-6 leading-none uppercase">
                            <span className="text-white">Sri Dhakshina</span> <span className="text-festive-gold">Crackers</span>
                        </h1>
                        
                        <p className="text-gray-200 text-base md:text-lg mb-10 max-w-2xl leading-relaxed font-medium">
                            Experience the magic of lights with the most trusted fireworks brand. Pure quality, unbeatable prices, and grand celebrations.
                        </p>

                        <div className="flex flex-col sm:flex-row flex-wrap justify-center md:justify-start gap-4 sm:gap-5 w-full sm:w-auto">
                            <button
                                onClick={() => {
                                    if (priceListUrl) {
                                        window.open(priceListUrl, '_blank');
                                    } else {
                                        const el = document.getElementById('pricelist');
                                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                                    }
                                }}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-festive-gold text-festive-purple font-black text-sm sm:text-base uppercase tracking-wider hover:scale-105 transition-all shadow-[0_0_25px_rgba(255,215,0,0.4)] cursor-pointer"
                            >
                                View Price List
                            </button>
                            <button 
                                onClick={() => {
                                    const el = document.getElementById('contact');
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-white text-white font-black text-sm sm:text-base uppercase tracking-wider hover:bg-white hover:text-festive-purple transition-all cursor-pointer"
                            >
                                Contact Us
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
