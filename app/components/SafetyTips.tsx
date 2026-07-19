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
                <div className="text-center mb-20">
                    <div className="inline-block px-6 py-2 rounded-full bg-festive-red text-white font-black uppercase tracking-[0.3em] text-sm mb-6 shadow-lg animate-pulse">
                        Safety First
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-festive-purple mb-6 uppercase tracking-tighter">
                        Important <span className="text-festive-red">Safety</span> Rules
                    </h2>
                    <p className="text-gray-500 max-w-2xl mx-auto font-medium text-lg">
                        Please follow these easy rules to stay safe and enjoy your crackers happily.
                    </p>
                </div>

                {/* Tips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {safetyTips.map((tip) => (
                        <div 
                            key={tip.id} 
                            className="p-10 rounded-[2rem] bg-gray-50 border border-gray-100 transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl hover:bg-white group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-4xl mb-8 group-hover:scale-110 transition-transform">
                                {tip.icon}
                            </div>
                            <h3 className="text-2xl font-black text-festive-purple mb-4 uppercase tracking-tight">{tip.title}</h3>
                            <p className="text-gray-500 leading-relaxed font-medium">
                                {tip.description}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Important Warning */}
                <div className="mt-20 p-8 md:p-12 rounded-[2.5rem] bg-festive-red text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="text-5xl">⚠️</div>
                        <div className="flex-grow text-center md:text-left">
                            <h4 className="text-2xl md:text-3xl font-black uppercase mb-2">Emergency Note</h4>
                            <p className="text-white/80 font-medium">
                                In case of any minor burns, immediately wash the area with cold water. For any serious injuries, please contact your nearest medical center immediately.
                            </p>
                        </div>
                        <div className="flex-shrink-0">
                             <a href="tel:108" className="px-10 py-4 rounded-full bg-white text-festive-red font-black uppercase tracking-widest hover:scale-110 transition-transform inline-block">
                                Emergency: 108
                             </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
