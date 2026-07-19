"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
    id: number;
    name: string;
    price: number;
    originalPrice: number;
    image: string;
    category: string;
    categoryId: number;
    discount?: number;
}

export default function ProductCard({ id, name, price, originalPrice, image, category, categoryId, discount }: ProductCardProps) {
    const router = useRouter();
    const { addToCart } = useCart();

    const handleAddAndGo = () => {
        addToCart({ id, name, price, originalPrice, image, category });
        router.push(`/products?scroll=category-sec-${categoryId}`);
    };

    const discountPct = discount ?? Math.round(((originalPrice - price) / originalPrice) * 100);

    return (
        <div className="group relative w-full bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-2xl hover:border-festive-gold/50 transition-all duration-500 flex flex-col">
            {/* Image Container */}
            <div className="relative h-60 w-full overflow-hidden bg-gray-50">
                <Image
                    src={image}
                    alt={name}
                    fill
                    className="object-contain p-6 transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Sale Badge */}
                {originalPrice > price && (
                    <div className="absolute top-4 left-4 bg-festive-red text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md">
                        Save ₹{originalPrice - price}
                    </div>
                )}

                {/* Offer % */}
                {originalPrice > price && (
                    <div className="absolute top-4 right-4 bg-festive-gold text-festive-purple text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-md">
                        {discountPct}% OFF
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 flex flex-col flex-grow">
                <span className="text-xs font-black text-festive-red uppercase tracking-[0.2em] mb-2">{category}</span>
                <h3 className="text-festive-purple font-black text-xl mb-2 line-clamp-2 min-h-[3.5rem]">
                    {name}
                </h3>

                <div className="flex items-center gap-3 mb-6 mt-auto">
                    <span className="text-3xl font-black text-festive-purple">₹{price}</span>
                    {originalPrice > price && (
                        <span className="text-base text-gray-400 line-through font-bold">₹{originalPrice}</span>
                    )}
                </div>

                {/* Action Button — adds to cart & goes to /products */}
                <button
                    onClick={handleAddAndGo}
                    className="w-full py-4 rounded-xl bg-festive-purple border-2 border-festive-purple text-white font-black text-sm tracking-widest uppercase transition-all duration-300 hover:bg-festive-red hover:border-festive-red hover:shadow-lg shadow-md active:scale-95 cursor-pointer"
                >
                    ➕ Add to Cart
                </button>
            </div>
        </div>
    );
}
