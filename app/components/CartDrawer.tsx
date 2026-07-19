"use client";
import React, { useState } from "react";
import Image from "next/image";
import { useCart } from "../context/CartContext";

export default function CartDrawer() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartCount,
    cartTotal,
    cartOriginalTotal,
    cartDiscountableOriginalTotal,
    cartSavings,
    isCartOpen,
    setCartOpen,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerCity, setCustomerCity] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [errors, setErrors] = useState({ name: false, phone: false, email: false, city: false, address: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isCartOpen) return null;

  const handleConfirmOrder = async () => {
    const newErrors = {
      name: !customerName.trim(),
      phone: !customerPhone.trim(),
      email: customerEmail.trim() !== "" ? !customerEmail.includes('@') : false,
      city: !customerCity.trim(),
      address: !customerAddress.trim(),
    };

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      setShowCheckoutForm(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const orderData = {
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        customer_city: customerCity,
        customer_address: customerAddress,
        total_amount: cartTotal,
        total_savings: cartSavings,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          price: item.price,
          originalPrice: item.originalPrice,
          quantity: item.quantity
        }))
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${apiUrl}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      console.log("Order Placed Successfully!");
      if (responseData.emailSent) {
        console.log("%c✅ SUCCESS: Email was sent to the Admin successfully!", "color: #10b981; font-weight: bold; font-size: 14px;");
      } else {
        console.log("%c⚠️ NOTE: Order saved, but Email was NOT sent (Check backend .env credentials)", "color: #f59e0b; font-weight: bold; font-size: 14px;");
      }

      setErrors({ name: false, phone: false, email: false, city: false, address: false });
      setShowSuccessPopup(true);
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('There was a problem submitting your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-['Outfit']">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity"
        onClick={() => setCartOpen(false)}
      ></div>

      {/* Centered Modal Container */}
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white border border-gray-100 rounded-3xl text-slate-800 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-fadeIn">
        
        {/* Submitting Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col justify-center items-center gap-4">
            <div className="w-12 h-12 border-4 border-festive-red border-t-transparent rounded-full animate-spin"></div>
            <p className="font-bold text-slate-800 text-lg animate-pulse tracking-wide">Placing Your Order...</p>
          </div>
        )}

        {/* Subtle Ambient Glow inside modal */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-festive-gold/5 blur-[80px] pointer-events-none rounded-full"></div>

        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between relative z-10 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <span className="text-2xl drop-shadow-sm">🛒</span>
            <h2 className="text-xl font-black uppercase tracking-widest text-festive-purple">
              Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-festive-red to-orange-500">Cart</span>
              <span className="ml-3 text-xs bg-festive-gold/15 text-festive-purple border border-festive-gold/30 px-2.5 py-1 rounded-full relative -top-0.5 shadow-sm">
                {cartCount} ITEMS
              </span>
            </h2>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-400 hover:text-festive-red hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* Cart Contents */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-6 space-y-5 relative z-10">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 py-10">
              <div className="w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm">
                <span className="text-6xl animate-pulse drop-shadow-sm">✨</span>
              </div>
              <div>
                <h3 className="text-slate-800 font-black uppercase tracking-widest text-lg mb-2">
                  Your cart is empty
                </h3>
                <p className="text-base text-slate-500 max-w-sm mx-auto leading-relaxed font-medium">
                  Browse our premium fireworks catalog to add your favorite sparklers and sky shots!
                </p>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="px-10 py-3.5 rounded-full bg-gradient-to-r from-festive-gold to-yellow-400 text-festive-purple font-black text-base uppercase tracking-widest hover:scale-105 transition-all shadow-[0_8px_20px_rgba(255,215,0,0.4)] mt-4"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Item List */}
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const discountPercent = item.originalPrice > 0 ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-5 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-festive-gold/30 transition-all group relative overflow-hidden items-center"
                    >
                      {/* Image */}
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 flex items-center justify-center p-2 group-hover:bg-amber-50/50 transition-colors duration-300">
                        <img
                          src={item.image || "/assets/images/placeholder.png"}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <span className="text-[9px] uppercase font-bold text-slate-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 inline-block mb-1.5">
                            {item.category}
                          </span>
                          <h4 className="text-base sm:text-base font-black text-slate-800 tracking-wide leading-tight group-hover:text-festive-purple transition-colors line-clamp-2">
                            {item.name}
                          </h4>
                          
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-base font-black text-festive-purple drop-shadow-sm">
                              ₹{item.price}
                            </span>
                            <span className="text-xs text-slate-400 line-through font-bold">
                              ₹{item.originalPrice}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2">
                          {/* Quantity Controls */}
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group-hover:border-festive-gold/40 transition-colors shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3.5 py-2 text-base font-black text-slate-500 hover:bg-gray-100 hover:text-festive-red transition-colors cursor-pointer"
                            >
                              −
                            </button>
                            <span className="px-4 py-2 text-base font-black min-w-[36px] text-center bg-white border-x border-gray-200 text-slate-900 shadow-inner">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3.5 py-2 text-base font-black text-slate-500 hover:bg-gray-100 hover:text-festive-purple transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-base font-black text-slate-900 hidden sm:block drop-shadow-sm">
                              ₹{item.price * item.quantity}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-400 hover:text-festive-red hover:bg-red-50 rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Checkout Information Form */}
              <div className="pt-4 pb-2">
                <button
                  onClick={() => setShowCheckoutForm(!showCheckoutForm)}
                  className={`w-full flex items-center justify-between text-sm sm:text-sm font-black uppercase tracking-wider p-4 rounded-xl transition-all border cursor-pointer ${showCheckoutForm ? 'bg-festive-gold/10 border-festive-gold/30 text-festive-purple shadow-sm' : 'bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100 hover:border-gray-300'}`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">📋</span> Customer & Delivery Details
                  </span>
                  <span className={`transform transition-transform ${showCheckoutForm ? 'rotate-180' : ''}`}>▼</span>
                </button>

                {showCheckoutForm && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 animate-fadeIn shadow-inner">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => { setCustomerName(e.target.value); if(errors.name) setErrors({...errors, name: false}); }}
                        placeholder="e.g. John Doe"
                        className={`w-full bg-white border ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-festive-gold focus:ring-festive-gold/20'} rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium shadow-sm`}
                      />
                      {errors.name && <span className="text-red-500 text-sm font-bold mt-1 block animate-fadeIn">* Full Name is required</span>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => { setCustomerPhone(e.target.value); if(errors.phone) setErrors({...errors, phone: false}); }}
                        placeholder="e.g. 9894116131"
                        className={`w-full bg-white border ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-festive-gold focus:ring-festive-gold/20'} rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium shadow-sm`}
                      />
                      {errors.phone && <span className="text-red-500 text-sm font-bold mt-1 block animate-fadeIn">* Contact Number is required</span>}
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => { setCustomerEmail(e.target.value); if(errors.email) setErrors({...errors, email: false}); }}
                        placeholder="e.g. name@example.com"
                        className={`w-full bg-white border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-festive-gold focus:ring-festive-gold/20'} rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium shadow-sm`}
                      />
                      {errors.email && <span className="text-red-500 text-sm font-bold mt-1 block animate-fadeIn">* Please enter a valid email address</span>}
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
                        Full Delivery Address
                      </label>
                      <textarea
                        rows={2}
                        value={customerAddress}
                        onChange={(e) => { setCustomerAddress(e.target.value); if(errors.address) setErrors({...errors, address: false}); }}
                        placeholder="e.g. Street Name, Area, Pincode"
                        className={`w-full bg-white border ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-festive-gold focus:ring-festive-gold/20'} rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium resize-none shadow-sm`}
                      />
                      {errors.address && <span className="text-red-500 text-sm font-bold mt-1 block animate-fadeIn">* Address is required</span>}
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="block text-xs font-black uppercase tracking-widest text-slate-500">
                        Delivery City/Town
                      </label>
                      <input
                        type="text"
                        value={customerCity}
                        onChange={(e) => { setCustomerCity(e.target.value); if(errors.city) setErrors({...errors, city: false}); }}
                        placeholder="e.g. Sivakasi"
                        className={`w-full bg-white border ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-festive-gold focus:ring-festive-gold/20'} rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium shadow-sm`}
                      />
                      {errors.city && <span className="text-red-500 text-sm font-bold mt-1 block animate-fadeIn">* City/Town is required</span>}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sticky Summary & Action Footer */}
        {cartItems.length > 0 && (
          <div className="px-6 py-6 bg-gray-50/90 border-t border-gray-200 backdrop-blur-xl relative z-10 flex flex-col sm:flex-row gap-5 items-center justify-between">
            <div className="w-full sm:w-auto flex-1">
              <div className="flex items-end gap-4 mb-2">
                <span className="text-base font-black text-slate-500 uppercase tracking-wider pb-1">Total:</span>
                <span className="text-3xl font-black text-festive-purple drop-shadow-sm leading-none">
                  ₹{cartTotal}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm font-bold text-emerald-600">
                <span>Savings: ₹{cartSavings}</span>
                <span className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-black shadow-sm">
                  {cartDiscountableOriginalTotal > 0 ? Math.round((cartSavings / cartDiscountableOriginalTotal) * 100) : 0}% OFF
                </span>
              </div>
            </div>

            <div className="w-full sm:w-auto flex gap-3">
              <button
                onClick={clearCart}
                title="Clear all cart items"
                className="w-14 h-14 rounded-xl border border-gray-200 bg-white text-slate-400 hover:text-festive-red hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer flex-shrink-0 shadow-sm"
              >
                <span className="text-xl">🗑️</span>
              </button>
              <button
                onClick={handleConfirmOrder}
                className="flex-1 sm:px-8 h-14 rounded-xl bg-festive-red hover:bg-festive-gold text-white hover:text-festive-purple font-black text-base uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_10px_25px_rgba(255,215,0,0.4)] border border-transparent hover:border-festive-gold cursor-pointer flex items-center justify-center gap-2"
              >
                <span className="text-xl">✨</span> Confirm Order
              </button>
            </div>
          </div>
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 font-['Outfit']">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"></div>
            <div className="relative bg-white border border-gray-100 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-fadeIn transform scale-100">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200 shadow-sm">
                <span className="text-5xl">✅</span>
              </div>
              <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-3">Order Confirmed</h3>
              <p className="text-slate-600 leading-relaxed font-medium mb-8 text-base sm:text-base">
                Thank you for placing your order! Our team will contact you shortly to confirm the details.
              </p>
              <button
                onClick={() => {
                  setShowSuccessPopup(false);
                  clearCart();
                  setCartOpen(false);
                }}
                className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_8px_20px_rgba(16,185,129,0.25)]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
