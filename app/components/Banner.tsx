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
