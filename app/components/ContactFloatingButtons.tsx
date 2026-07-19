"use client";
import React from 'react';

export default function ContactFloatingButtons() {
    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[100] flex flex-col gap-3 sm:gap-4 animate-slideDown">
            {/* WhatsApp Button */}
            <a 
                href="https://wa.me/919894116131" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-all group"
            >
                <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" 
                    alt="WhatsApp" 
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10"
                />
                <span className="absolute right-full mr-4 bg-white text-black text-sm font-black px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                    Chat on WhatsApp
                </span>
            </a>

            {/* Call Button */}
            <a 
                href="tel:+919894116131"
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-festive-red rounded-full flex items-center justify-center shadow-[0_8px_20px_rgba(185,28,28,0.4)] hover:scale-110 transition-all group"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="white" className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
                </svg>
                <span className="absolute right-full mr-4 bg-white text-black text-sm font-black px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                    Call Now
                </span>
            </a>
        </div>
    );
}
