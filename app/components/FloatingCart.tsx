"use client";
import React, { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";

export default function FloatingCart() {
  const { cartCount, cartTotal, setCartOpen, isCartOpen } = useCart();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show when there are items in the cart AND the cart drawer is closed
    setIsVisible(cartCount > 0 && !isCartOpen);
  }, [cartCount, isCartOpen]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full z-[100] lg:hidden animate-[slideUp_0.4s_ease-out]">
      <div className="bg-gradient-to-r from-[#2d0a4c] to-[#3d1166] text-white p-3.5 pb-safe flex items-center justify-between shadow-[0_-8px_25px_rgba(0,0,0,0.6)] border-t-[1.5px] border-festive-gold/40">
        <div className="flex flex-col ml-1">
          <span className="text-white/80 text-[10px] font-bold uppercase tracking-widest mb-0.5">
            {cartCount} {cartCount === 1 ? "Item" : "Items"} in cart
          </span>
          <div className="flex items-end gap-1">
             <span className="text-xl font-black tracking-wider leading-none text-festive-gold">
               ₹{cartTotal}
             </span>
             <span className="text-[9px] font-bold text-white/50 mb-0.5 ml-1">PLUS TAXES</span>
          </div>
        </div>
        
        <button
          onClick={() => setCartOpen(true)}
          className="bg-white text-[#3d1166] px-5 py-2.5 rounded-xl font-black text-sm uppercase tracking-[0.1em] shadow-[0_4px_15px_rgba(255,255,255,0.2)] flex items-center gap-1.5 active:scale-95 transition-all"
        >
          View Cart 
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#3d1166]">
            <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
}
