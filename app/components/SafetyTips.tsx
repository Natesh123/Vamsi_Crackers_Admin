'use client';

import React from 'react';

const safetyTips = [
    {
        id: 1,
        title: "Keep Distance",
        description: "Always maintain a safe distance of at least 5 meters from any lit firework.",
        icon: "📏"
    },
    {
        id: 2,
        title: "Use a Lighter/Agarbatti",
        description: "Use a long stick or agarbatti to light crackers. Never use matchsticks or lighters directly.",
        icon: "🕯️"
    },
    {
        id: 3,
        title: "Adult Supervision",
        description: "Children must always be supervised by adults while lighting any type of firework.",
        icon: "👨‍👩-👧"
    },
    {
        id: 4,
        title: "Water Bucket Handy",
        description: "Always keep a bucket of water or sand nearby to extinguish any accidental fires or used crackers.",
        icon: "🪣"
    },
    {
        id: 5,
        title: "Open Space Only",
        description: "Only light fireworks in open grounds or terraces. Never light them inside the house or near vehicles.",
        icon: "🌳"
    },
    {
        id: 6,
        title: "Cotton Clothes",
        description: "Wear thick cotton clothes while lighting crackers. Avoid loose or synthetic clothing.",
        icon: "👕"
    }
];

export default function SafetyTips() {
    return (
        <section id="safety-tips" className="bg-white py-24 scroll-mt-24">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-12 md:mb-20">
                    <div className="inline-block px-5 py-1.5 md:px-6 md:py-2 rounded-full bg-festive-red text-white font-semibold uppercase tracking-[0.3em] text-xs md:text-sm mb-4 md:mb-6 shadow-lg animate-pulse">
                        Safety First
                    </div>
                    <h2 className="text-3xl md:text-6xl font-semibold text-festive-purple mb-4 md:mb-6 uppercase tracking-tighter">
                        Important <span className="text-festive-red">Safety</span> Rules
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto font-medium text-base md:text-lg">
                        Please follow these easy rules to stay safe and enjoy your crackers happily.
                    </p>
                </div>

                {/* Tips Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-10">
                    {safetyTips.map((tip) => (
                        <div 
                            key={tip.id} 
                            className="p-6 md:p-10 rounded-3xl md:rounded-[2rem] bg-gray-50 border border-gray-100 transition-all duration-500 hover:-translate-y-2 md:hover:-translate-y-3 hover:shadow-xl hover:bg-white group"
                        >
                            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white shadow-md flex items-center justify-center text-3xl md:text-4xl mb-5 md:mb-8 group-hover:scale-110 transition-transform">
                                {tip.icon}
                            </div>
                            <h3 className="text-xl md:text-2xl font-semibold text-festive-purple mb-3 md:mb-4 uppercase tracking-tight">{tip.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-medium text-sm md:text-base">
                                {tip.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Important Warning */}
                <div className="mt-12 md:mt-20 p-6 md:p-12 rounded-3xl md:rounded-[2.5rem] bg-festive-red text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-8">
                        <div className="text-4xl md:text-5xl">⚠️</div>
                        <div className="flex-grow text-center md:text-left">
                            <h4 className="text-xl md:text-3xl font-semibold uppercase mb-2">Emergency Note</h4>
                            <p className="text-white/90 font-medium text-sm md:text-base leading-relaxed">
                                In case of any minor burns, immediately wash the area with cold water. For any serious injuries, please contact your nearest medical center immediately.
                            </p>
                        </div>
                        <div className="flex-shrink-0 w-full md:w-auto mt-2 md:mt-0">
                             <a href="tel:108" className="px-8 py-3.5 md:px-10 md:py-4 w-full md:w-auto text-center rounded-full bg-white text-festive-red font-semibold uppercase tracking-widest hover:scale-105 md:hover:scale-110 transition-transform block">
                                Emergency: 108
                             </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
