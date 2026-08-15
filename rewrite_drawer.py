import re

with open("app/components/CartDrawer.tsx", "r") as f:
    content = f.read()

# 1. Replace states
content = re.sub(
    r'const \[showCheckoutForm, setShowCheckoutForm\] = useState\(false\);\n\s*const \[checkoutStep, setCheckoutStep\] = useState\(1\);',
    r'const [cartStep, setCartStep] = useState(1);',
    content
)

# 2. Replace handleConfirmOrder errors
content = re.sub(
    r'const step1Errors = \{.*?\};\s*const step2Errors = \{.*?\};\s*const newErrors = \{ \.\.\.step1Errors, \.\.\.step2Errors \};\s*if \(Object\.values\(newErrors\)\.some\(Boolean\)\) \{.*?return;\n\s*\}' ,
    r'''const newErrors = {
      name: !customerName.trim(),
      phone: !customerPhone.trim(),
      email: customerEmail.trim() !== "" ? !customerEmail.includes('@') : false,
      city: !customerCity.trim(),
      address: !customerAddress.trim(),
    };

    if (Object.values(newErrors).some(Boolean)) {
      setErrors(newErrors);
      return;
    }''',
    content,
    flags=re.DOTALL
)

# 3. Replace cart contents and footer
# We'll locate "Item List" and replace until "Success Popup"
parts = content.split('{/* Item List */}')
header_part = parts[0]
rest = parts[1]
rest_parts = rest.split('{/* Success Popup */}')
popup_part = rest_parts[1]

# Reconstruct the body
new_body = '''{cartStep === 1 ? (
              <div className="space-y-4 animate-fadeIn">
                <div className="flex justify-between items-center mb-4 px-2">
                  <h4 className="font-bold text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="bg-festive-purple text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    Review Products
                  </h4>
                  <span className="text-xs text-slate-500 font-bold bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">Step 1 of 2</span>
                </div>
                {cartItems.map((item) => {
                  const discountPercent = item.originalPrice > 0 ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;
                  return (
                    <div
                      key={item.id}
                      className="flex gap-5 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-festive-gold/30 transition-all group relative overflow-hidden items-center"
                    >
                      <div className="relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 flex items-center justify-center p-2 group-hover:bg-amber-50/50 transition-colors duration-300">
                        <img
                          src={item.image || "/assets/images/placeholder.png"}
                          alt={item.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                        />
                      </div>
                      <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1">
                          <span className="text-[9px] uppercase font-bold text-slate-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 inline-block mb-1.5">
                            {item.category}
                          </span>
                          <h4 className="text-base sm:text-base font-semibold text-slate-800 tracking-wide leading-tight group-hover:text-festive-purple transition-colors line-clamp-2">
                            {item.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-2">
                            <span className="text-base font-semibold text-festive-purple drop-shadow-sm">
                              ₹{item.price}
                            </span>
                            <span className="text-xs text-slate-400 line-through font-bold">
                              ₹{item.originalPrice}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2">
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group-hover:border-festive-gold/40 transition-colors shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3.5 py-2 text-base font-semibold text-slate-500 hover:bg-gray-100 hover:text-festive-red transition-colors cursor-pointer"
                            >
                              −
                            </button>
                            <input 
                              type="number" 
                              value={item.quantity} 
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                if (!isNaN(val) && val >= 0) updateQuantity(item.id, val);
                              }}
                              className="px-2 py-2 w-12 text-base font-semibold text-center bg-white border-x border-gray-200 text-slate-900 shadow-inner outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3.5 py-2 text-base font-semibold text-slate-500 hover:bg-gray-100 hover:text-festive-purple transition-colors cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-base font-semibold text-slate-900 hidden sm:block drop-shadow-sm">
                              ₹{item.price * item.quantity}
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-festive-red bg-red-50 hover:bg-festive-red hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
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
            ) : (
              <div className="bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 animate-fadeIn shadow-inner mt-2">
                <div className="flex justify-between items-center mb-6">
                  <h4 className="font-bold text-slate-800 uppercase tracking-widest text-sm flex items-center gap-2">
                    <span className="bg-festive-purple text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                    Delivery Details
                  </h4>
                  <span className="text-xs text-slate-500 font-bold bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">Step 2 of 2</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
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
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
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
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
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
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
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
                    <label className="block text-xs font-semibold uppercase tracking-widest text-slate-500">
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
              </div>
            )}
          </>
        )}
      </div>

      {/* Sticky Summary & Action Footer */}
      {cartItems.length > 0 && (
        <div className="px-6 py-6 bg-gray-50/90 border-t border-gray-200 backdrop-blur-xl relative z-10 flex flex-col sm:flex-row gap-5 items-center justify-between">
          <div className="w-full sm:w-auto flex-1">
            <div className="flex items-end gap-4 mb-2">
              <span className="text-base font-semibold text-slate-500 uppercase tracking-wider pb-1">Total:</span>
              <span className="text-3xl font-semibold text-festive-purple drop-shadow-sm leading-none">
                ₹{cartTotal}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm font-bold text-emerald-600">
              <span>Savings: ₹{cartSavings}</span>
              <span className="bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-semibold shadow-sm">
                {cartDiscountableOriginalTotal > 0 ? Math.round((cartSavings / cartDiscountableOriginalTotal) * 100) : 0}% OFF
              </span>
            </div>
          </div>

          <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            {cartStep === 1 ? (
              <>
                <button
                  onClick={() => setCartOpen(false)}
                  className="w-full sm:flex-1 h-12 sm:h-14 rounded-xl bg-white text-[#3d1166] font-semibold text-sm sm:text-base uppercase tracking-[0.1em] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(61,17,102,0.1)] hover:shadow-[0_8px_25px_rgba(61,17,102,0.25)] active:scale-95 group overflow-hidden border-[2.5px] border-[#3d1166] relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#2d0a4c] to-[#3d1166] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="text-xl relative z-10 text-[#3d1166] group-hover:text-festive-gold transition-colors duration-300 group-hover:rotate-90">➕</span>
                  <span className="relative z-10 group-hover:text-white transition-colors duration-300 drop-shadow-sm">Add More</span>
                </button>
                
                {minOrderValue > 0 && cartTotal < minOrderValue ? (
                  <div className="flex-1 sm:px-6 h-14 rounded-xl bg-orange-50 text-orange-800 font-bold text-sm sm:text-base border border-orange-200 flex flex-col items-center justify-center text-center shadow-inner leading-tight">
                    <span>Min Order: ₹{minOrderValue.toLocaleString('en-IN')}</span>
                    <span className="text-xs text-orange-600 tracking-wide uppercase">Add ₹{(minOrderValue - cartTotal).toLocaleString('en-IN')} more</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setCartStep(2)}
                    className="flex-1 sm:px-8 h-14 rounded-xl bg-festive-purple hover:bg-[#2d0a4c] text-white font-semibold text-base uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-[0_8px_20px_rgba(61,17,102,0.25)] cursor-pointer flex items-center justify-center gap-2"
                  >
                    Delivery Details <span className="text-lg">→</span>
                  </button>
                )}
              </>
            ) : (
              <>
                <button
                  onClick={() => setCartStep(1)}
                  className="w-full sm:flex-1 h-12 sm:h-14 rounded-xl bg-white text-slate-600 font-semibold text-sm sm:text-base uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 border border-gray-300 hover:border-slate-500 hover:bg-gray-50 active:scale-95"
                >
                  <span className="text-lg">←</span> Back to Cart
                </button>
                
                <button
                  onClick={handleConfirmOrder}
                  className="flex-1 sm:px-8 h-14 rounded-xl bg-festive-red hover:bg-festive-gold text-white hover:text-festive-purple font-semibold text-base uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_10px_25px_rgba(255,215,0,0.4)] border border-transparent hover:border-festive-gold cursor-pointer flex items-center justify-center gap-2"
                >
                  <span className="text-xl">✨</span> Confirm Order
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Success Popup */}'''

with open("app/components/CartDrawer.tsx", "w") as f:
    f.write(header_part + new_body + popup_part)

