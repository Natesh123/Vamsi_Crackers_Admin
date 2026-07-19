'use client';

import React from 'react';
import Image from 'next/image';

const galleryImages = [
    { id: 1, title: "Purple Rain", src: "/assets/images/gallery/firework_1.png", tag: "Sky Shot" },
    { id: 2, title: "Golden Willow", src: "/assets/images/gallery/firework_2.png", tag: "Classic" },
    { id: 3, title: "Emerald Burst", src: "/assets/images/gallery/firework_3.png", tag: "Premium" },
    { id: 4, title: "Grand Finale", src: "/assets/images/gallery/firework_4.png", tag: "Mega Show" }
];

export default function FireworkGallery() {
    return (
        <section className="bg-black py-24 relative overflow-hidden">
            {/* Sparkle Particles Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-10 left-1/4 w-1 h-1 bg-white rounded-full animate-ping"></div>
                <div className="absolute top-1/2 left-1/2 w-1 h-1 bg-festive-gold rounded-full animate-ping delay-700"></div>
                <div className="absolute bottom-20 right-1/4 w-1 h-1 bg-white rounded-full animate-ping delay-1000"></div>
            </div>

            <div className="container mx-auto px-4 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-festive-gold text-base font-black tracking-[0.4em] uppercase mb-3 block">Visual Experience</span>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase tracking-tighter">
                        The <span className="text-festive-gold">Art</span> of Fire
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto font-medium">
                        Witness the breathtaking beauty of our premium fireworks captured in high definition.
                    </p>
                </div>

                {/* Gallery Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {galleryImages.map((img) => (
                        <div 
                            key={img.id} 
                            className="group relative rounded-[2rem] overflow-hidden aspect-[4/5] bg-gray-900 shadow-2xl transition-all duration-700 hover:scale-[1.02]"
                        >
                            <Image 
                                src={img.src} 
                                alt={img.title} 
                                fill 
                                className="object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                            />
                            
                            {/* Animated Glow Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
                            
                            {/* Explosion Pulse Effect (CSS) */}
                            <div className="absolute inset-0 border-2 border-festive-gold/0 group-hover:border-festive-gold/40 rounded-[2rem] transition-all duration-500 scale-95 group-hover:scale-100"></div>

                            {/* Content */}
                            <div className="absolute bottom-0 left-0 w-full p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <span className="inline-block px-3 py-1 rounded-full bg-festive-red text-white text-xs font-black uppercase tracking-widest mb-3">
                                    {img.tag}
                                </span>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight leading-none group-hover:text-festive-gold transition-colors">
                                    {img.title}
                                </h3>
                                <div className="w-0 group-hover:w-12 h-1 bg-festive-gold mt-4 transition-all duration-500"></div>
                            </div>

                            {/* Floating Sparkles (Emoji) */}
                            <div className="absolute top-6 right-6 text-2xl animate-bounce opacity-0 group-hover:opacity-100 transition-opacity">
                                ✨
                            </div>
                        </div>
                    ))}
                </div>

                {/* Experience Banner */}
                <div className="mt-20 p-1 bg-gradient-to-r from-transparent via-festive-gold/30 to-transparent rounded-full">
                     <div className="bg-black py-4 px-10 text-center rounded-full">
                        <p className="text-festive-gold text-sm md:text-sm font-black uppercase tracking-[0.5em] animate-pulse">
                            Captured live at Sivakasi manufacturing yards
                        </p>
                     </div>
                </div>
            </div>
        </section>
    );
}
