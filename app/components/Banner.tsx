'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

const defaultBannerImages = [
    '/assets/images/festive/banner_ai_1.png',
    '/assets/images/festive/banner_ai_2.png',
    '/assets/images/festive/banner_ai_3.png',
];

interface BannerProps {
    priceListUrl?: string;
}

export default function Banner({ priceListUrl = "" }: BannerProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [dynamicBanners, setDynamicBanners] = useState<string[]>([]);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
                const res = await fetch(`${apiUrl}/api/settings/banner-images/get`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.images && data.images.length > 0) {
                        setDynamicBanners(data.images);
                    }
                }
            } catch (e) {
                console.error("Error fetching dynamic banners", e);
            }
        };
        fetchBanners();
    }, []);

    const imagesToUse = dynamicBanners.length > 0 ? dynamicBanners : defaultBannerImages;
    const isDynamic = dynamicBanners.length > 0;

    useEffect(() => {
        const slideInterval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % imagesToUse.length);
        }, 8000);
        return () => clearInterval(slideInterval);
    }, [imagesToUse.length]);

    return (
        <div className="relative w-full h-[40vh] sm:h-[45vh] md:h-[50vh] lg:h-[55vh] overflow-hidden bg-black shadow-2xl">
            {/* Background Slides */}
            <div className="absolute inset-0 w-full h-full">
                {imagesToUse.map((src, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1500 ease-in-out ${currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0'
                            }`}
                    >
                        {/* Main Image (Fills container exactly, cropped nicely) */}
                        <img
                            src={src}
                            alt="Festive Banner"
                            className={`relative z-10 w-full h-full object-cover object-center transition-transform duration-[12000ms] ease-out ${currentSlide === index ? 'scale-[1.05]' : 'scale-100'}`}
                        />
                        <div className={`absolute inset-0 z-10 ${isDynamic ? 'bg-black/20' : 'bg-black/40'}`}></div>
                    </div>
                ))}
            </div>

            {/* Content Overlay */}
            <div className={`absolute inset-0 z-20 flex ${isDynamic ? 'items-end pb-12 justify-center' : 'items-center'}`}>
                <div className={`container mx-auto px-4 lg:px-12 flex flex-col ${isDynamic ? 'justify-end items-center h-full' : 'justify-center items-center md:items-start text-center md:text-left h-full'}`}>
                    
                    {!isDynamic && (
                        <div className="animate-slideDown max-w-4xl flex flex-col items-center md:items-start">
                             {/* Badge */}
                             <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-red-800 text-white mb-6 animate-sparkle shadow-[0_0_15px_rgba(220,38,38,0.6)] border border-red-500/50">
                                <span className="text-xs sm:text-sm font-black tracking-widest uppercase text-shadow-sm">✨ தரமான சிவகாசி பட்டாசுகள் ✨</span>
                            </div>
    
                            <h2 className="text-gray-200 text-lg md:text-xl font-bold mb-1 tracking-widest uppercase drop-shadow-md">
                                Welcome To
                            </h2>
                            <h1 className="text-4xl sm:text-5xl md:text-[5rem] font-black mb-1 leading-tight uppercase drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]">
                                <span className="text-white">Vamsi</span> <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-festive-gold to-yellow-500">Crackers</span>
                            </h1>
                            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black mb-8 text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)] tracking-wide">
                                வம்சி கிராக்கர்ஸ்
                            </h2>
                            
                            <p className="text-gray-100 text-lg sm:text-xl md:text-2xl md:leading-[1.8] mb-10 max-w-3xl font-semibold drop-shadow-[0_5px_15px_rgba(0,0,0,0.9)] bg-black/20 p-4 sm:p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                                மிகச் சிறந்த தரமான பட்டாசுகளுடன் உங்கள் கொண்டாட்டங்களை அழகாக்குங்கள்! குறைந்த விலையில் நிறைந்த தரம், பாதுகாப்பான வெடிகள். சிவகாசியின் முன்னணி நிறுவனம்.
                            </p>
                        </div>
                    )}

                    <div className={`hidden md:flex flex-col sm:flex-row flex-wrap justify-center ${!isDynamic ? 'md:justify-start' : ''} gap-4 sm:gap-5 w-full sm:w-auto ${isDynamic ? 'animate-slideUp drop-shadow-2xl' : ''}`}>
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
                            className={`w-full sm:w-auto px-8 py-3.5 rounded-full border-2 border-white text-white font-black text-sm sm:text-base uppercase tracking-wider transition-all cursor-pointer ${isDynamic ? 'bg-black/30 hover:bg-white hover:text-black backdrop-blur-sm' : 'hover:bg-white hover:text-festive-purple'}`}
                        >
                            Contact Us
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
