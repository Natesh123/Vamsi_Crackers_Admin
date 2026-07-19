'use client';
import Image from 'next/image';
import { useRef } from 'react';

const brands = [
  { id: 1, name: "Sony", img: "/assets/images/brands/sony.png" },
  { id: 2, name: "Leo", img: "/assets/images/brands/leo.png" },
  { id: 3, name: "Vanitha", img: "/assets/images/brands/vanitha.png" },
  { id: 4, name: "Vadivel", img: "/assets/images/brands/vadivel.png" },
];

export default function OurBrands() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-gray-50 to-white overflow-hidden relative">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-festive-purple/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-24 w-96 h-96 bg-festive-gold/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 md:px-12 mb-12 relative z-10">
        <div className="flex flex-col items-center justify-center text-center w-full">
            <h2 className="text-4xl md:text-5xl font-black text-festive-purple tracking-tighter mb-4 uppercase">
                Our Top <span className="text-festive-red">Brands</span>
            </h2>
            <p className="text-gray-500 text-lg md:text-xl font-medium max-w-2xl">
                We sell the best and safest fireworks from Sivakasi's top brands.
            </p>
            <div className="w-24 h-1.5 bg-festive-gold rounded-full mt-8"></div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-12 relative group z-10">
        {/* Navigation Arrows */}
        <button 
            onClick={() => scroll('left')}
            className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-white text-festive-purple flex items-center justify-center hover:bg-festive-purple hover:text-white hover:scale-110 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] opacity-100 md:opacity-0 group-hover:opacity-100"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 -ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
        </button>

        <button 
            onClick={() => scroll('right')}
            className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full bg-festive-gold text-white flex items-center justify-center hover:bg-yellow-500 hover:scale-110 transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] opacity-100 md:opacity-0 group-hover:opacity-100"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-7 h-7 ml-1">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
        </button>

        {/* Scrollable Container */}
        <div 
            ref={scrollRef}
            className="w-full flex overflow-x-auto gap-8 md:gap-12 items-center py-12 snap-x snap-mandatory px-4 md:px-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Hide webkit scrollbar */}
          <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none; }`}} />
          
          {[...brands, ...brands, ...brands].map((brand, i) => (
            <div key={`${brand.id}-${i}`} className="flex-none snap-center group/item cursor-pointer">
              {/* Premium Card Container */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 flex items-center justify-center p-8 transition-all duration-500 group-hover/item:-translate-y-4 group-hover/item:shadow-[0_20px_50px_rgb(0,0,0,0.15)] overflow-hidden">
                
                {/* Background glow effect inside card */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-50/50 opacity-0 group-hover/item:opacity-100 transition-opacity duration-500"></div>

                <Image 
                    src={brand.img} 
                    alt={brand.name} 
                    fill 
                    className="object-contain p-8 mix-blend-multiply filter group-hover/item:scale-110 transition-transform duration-700 relative z-10" 
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Pagination Dots */}
        <div className="flex justify-center mt-6 gap-3">
            <div className="w-10 h-2.5 rounded-full bg-festive-gold shadow-sm"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 hover:bg-festive-purple transition-colors cursor-pointer"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-gray-300 hover:bg-festive-purple transition-colors cursor-pointer"></div>
        </div>
      </div>
    </section>
  );
}
