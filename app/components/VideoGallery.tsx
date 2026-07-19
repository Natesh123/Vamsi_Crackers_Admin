'use client';

import React from 'react';

const crackerVideos = [
    {
        id: 1,
        title: "Sky Shot Extravaganza",
        url: "https://assets.mixkit.co/videos/preview/mixkit-fireworks-display-in-the-night-sky-10515-large.mp4",
        thumbnail: "https://images.pexels.com/photos/1387577/pexels-photo-1387577.jpeg"
    },
    {
        id: 2,
        title: "Magic Flower Pots",
        url: "https://assets.mixkit.co/videos/preview/mixkit-colorful-fireworks-exploding-in-the-night-sky-10512-large.mp4",
        thumbnail: "https://images.pexels.com/photos/1390433/pexels-photo-1390433.jpeg"
    },
    {
        id: 3,
        title: "Whistling Rockets",
        url: "https://assets.mixkit.co/videos/preview/mixkit-fireworks-exploding-in-the-dark-night-sky-10514-large.mp4",
        thumbnail: "https://images.pexels.com/photos/1387573/pexels-photo-1387573.jpeg"
    },
    {
        id: 4,
        title: "Golden Sparklers",
        url: "https://assets.mixkit.co/videos/preview/mixkit-fireworks-exploding-in-the-sky-at-night-10511-large.mp4",
        thumbnail: "https://images.pexels.com/photos/1387571/pexels-photo-1387571.jpeg"
    },
    {
        id: 5,
        title: "Grand Finale Show",
        url: "https://assets.mixkit.co/videos/preview/mixkit-bright-fireworks-in-the-night-sky-10516-large.mp4",
        thumbnail: "https://images.pexels.com/photos/3321613/pexels-photo-3321613.jpeg"
    }
];

export default function VideoGallery() {
    return (
        <section className="bg-gray-50 py-20 overflow-hidden">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-festive-red text-base font-black tracking-[0.3em] uppercase mb-3 block">Live Demonstration</span>
                    <h2 className="text-4xl md:text-6xl font-black text-festive-purple mb-4">
                        SEE THE <span className="text-festive-red">MAGIC</span> IN ACTION
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto font-medium">
                        Watch how our premium crackers light up the sky with vibrant colors and grand effects.
                    </p>
                    <div className="w-24 h-1.5 bg-festive-gold mx-auto mt-6 rounded-full"></div>
                </div>

                {/* Video Grid */}
                <div className="flex overflow-x-auto gap-6 pb-10 scrollbar-hide -mx-4 px-4 md:grid md:grid-cols-3 lg:grid-cols-5 md:overflow-visible md:px-0 md:mx-0">
                    {crackerVideos.map((video) => (
                        <div 
                            key={video.id} 
                            className="flex-shrink-0 w-[280px] md:w-auto group relative rounded-2xl overflow-hidden bg-black shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-festive-gold/20"
                        >
                            <div className="aspect-[9/16] relative">
                                <video 
                                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                    muted
                                    loop
                                    playsInline
                                    autoPlay
                                    poster={video.thumbnail}
                                >
                                    <source src={video.url} type="video/mp4" />
                                </video>
                                
                                {/* Overlay Content */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                                <div className="absolute bottom-0 left-0 w-full p-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-1">{video.title}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-festive-gold animate-pulse"></span>
                                        <span className="text-xs font-bold uppercase tracking-widest text-festive-gold">Watch Demo</span>
                                    </div>
                                </div>

                                {/* Play Icon Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity pointer-events-none">
                                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                                        <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Hint */}
                <div className="text-center mt-4 md:hidden">
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest animate-pulse">← Swipe to see more →</p>
                </div>
            </div>
        </section>
    );
}
