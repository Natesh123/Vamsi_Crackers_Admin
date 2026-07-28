(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/components/Loader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Loader
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function Loader() {
    _s();
    const [hideLoader, setHideLoader] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showButton, setShowButton] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const audioRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Loader.useEffect": ()=>{
            // Check if user has visited in this session
            const hasVisited = sessionStorage.getItem("visited");
            if (!hasVisited) {
                setShowButton(true);
                audioRef.current = new Audio("/assets/audio/bomb.mp3");
                audioRef.current.volume = 1;
            } else {
                // Refresh case: Hide loader after 2.5 seconds
                setTimeout({
                    "Loader.useEffect": ()=>{
                        setHideLoader(true);
                    }
                }["Loader.useEffect"], 2500);
            }
        }
    }["Loader.useEffect"], []);
    const handleEnterSite = ()=>{
        // Play audio only when button is clicked (Browser allows)
        if (audioRef.current) {
            audioRef.current.play().catch((err)=>console.error("Audio play error:", err));
        }
        // Mark as visited
        sessionStorage.setItem("visited", "true");
        // Hide loader
        setHideLoader(true);
    };
    if (hideLoader) return null;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 flex flex-col justify-center items-center bg-[#06010f] z-[9999]",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative flex flex-col items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 bg-amber-400/20 blur-3xl rounded-full animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/app/components/Loader.tsx",
                        lineNumber: 43,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        src: "/assets/images/vamsi_crackers_logo_v2.png",
                        alt: "Loading...",
                        className: "relative w-64 h-64 md:w-80 md:h-80 rounded-full object-cover mb-8 shadow-[0_0_40px_rgba(255,215,0,0.4)] animate-pulse"
                    }, void 0, false, {
                        fileName: "[project]/app/components/Loader.tsx",
                        lineNumber: 44,
                        columnNumber: 9
                    }, this),
                    !showButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-1 items-center text-amber-400 font-black tracking-[0.3em] uppercase text-sm mt-4 animate-pulse",
                        children: "LOADING PLEASE WAIT..."
                    }, void 0, false, {
                        fileName: "[project]/app/components/Loader.tsx",
                        lineNumber: 51,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/Loader.tsx",
                lineNumber: 42,
                columnNumber: 7
            }, this),
            showButton && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: handleEnterSite,
                className: "mt-6 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 px-10 py-4 rounded-full font-black text-lg uppercase tracking-widest shadow-[0_0_25px_rgba(255,215,0,0.5)] hover:scale-110 active:scale-95 transition-transform",
                children: "🚀 ENTER WEBSITE"
            }, void 0, false, {
                fileName: "[project]/app/components/Loader.tsx",
                lineNumber: 58,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/Loader.tsx",
        lineNumber: 41,
        columnNumber: 5
    }, this);
}
_s(Loader, "i0pgIHmJcEYhMEzZ4FuxusU1EME=");
_c = Loader;
var _c;
__turbopack_context__.k.register(_c, "Loader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/context/CartContext.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "CartProvider",
    ()=>CartProvider,
    "useCart",
    ()=>useCart
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
const CartContext = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(undefined);
function CartProvider({ children }) {
    _s();
    const [cartItems, setCartItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [isCartOpen, setCartOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isMounted, setIsMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // Load from local storage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CartProvider.useEffect": ()=>{
            setIsMounted(true);
            const savedCart = localStorage.getItem("crackers_city_cart");
            if (savedCart) {
                try {
                    const parsed = JSON.parse(savedCart);
                    if (Array.isArray(parsed)) {
                        setCartItems(parsed);
                    } else {
                        console.warn("Cart storage is corrupted, resetting to empty array.");
                        setCartItems([]);
                        localStorage.removeItem("crackers_city_cart");
                    }
                } catch (e) {
                    console.error("Error parsing cart storage:", e);
                    setCartItems([]);
                    localStorage.removeItem("crackers_city_cart");
                }
            }
        }
    }["CartProvider.useEffect"], []);
    // Save to local storage
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CartProvider.useEffect": ()=>{
            if (isMounted) {
                localStorage.setItem("crackers_city_cart", JSON.stringify(cartItems));
            }
        }
    }["CartProvider.useEffect"], [
        cartItems,
        isMounted
    ]);
    const addToCart = (product, quantity = 1)=>{
        if (quantity <= 0) {
            removeFromCart(product.id);
            return;
        }
        setCartItems((prevItems)=>{
            const existing = prevItems.find((item)=>item.id === product.id);
            if (existing) {
                return prevItems.map((item)=>item.id === product.id ? {
                        ...item,
                        quantity: item.quantity + quantity
                    } : item);
            }
            return [
                ...prevItems,
                {
                    ...product,
                    quantity
                }
            ];
        });
    };
    const updateQuantity = (productId, quantity)=>{
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }
        setCartItems((prevItems)=>prevItems.map((item)=>item.id === productId ? {
                    ...item,
                    quantity
                } : item));
    };
    const removeFromCart = (productId)=>{
        setCartItems((prevItems)=>prevItems.filter((item)=>item.id !== productId));
    };
    const clearCart = ()=>{
        setCartItems([]);
    };
    const cartCount = cartItems.reduce((acc, item)=>acc + item.quantity, 0);
    const cartTotal = cartItems.reduce((acc, item)=>acc + item.price * item.quantity, 0);
    const cartOriginalTotal = cartItems.reduce((acc, item)=>acc + item.originalPrice * item.quantity, 0);
    const cartDiscountableOriginalTotal = cartItems.reduce((acc, item)=>acc + (item.originalPrice > item.price ? item.originalPrice * item.quantity : 0), 0);
    const cartSavings = cartOriginalTotal - cartTotal;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CartContext.Provider, {
        value: {
            cartItems,
            addToCart,
            updateQuantity,
            removeFromCart,
            clearCart,
            cartCount,
            cartTotal,
            cartOriginalTotal,
            cartDiscountableOriginalTotal,
            cartSavings,
            isCartOpen,
            setCartOpen
        },
        children: children
    }, void 0, false, {
        fileName: "[project]/app/context/CartContext.tsx",
        lineNumber: 108,
        columnNumber: 5
    }, this);
}
_s(CartProvider, "3RSjbUfqOk9hl+P4lOx2LoPPb5c=");
_c = CartProvider;
function useCart() {
    _s1();
    const context = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
_s1(useCart, "b9L3QQ+jgeyIrH0NfHrJ8nn7VMU=");
var _c;
__turbopack_context__.k.register(_c, "CartProvider");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/components/CartDrawer.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>CartDrawer
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/context/CartContext.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
function CartDrawer() {
    _s();
    const { cartItems, updateQuantity, removeFromCart, clearCart, cartCount, cartTotal, cartOriginalTotal, cartDiscountableOriginalTotal, cartSavings, isCartOpen, setCartOpen } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"])();
    const [customerName, setCustomerName] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [customerPhone, setCustomerPhone] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [customerEmail, setCustomerEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [customerCity, setCustomerCity] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [customerAddress, setCustomerAddress] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [showCheckoutForm, setShowCheckoutForm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showSuccessPopup, setShowSuccessPopup] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [errors, setErrors] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        name: false,
        phone: false,
        email: false,
        city: false,
        address: false
    });
    const [isSubmitting, setIsSubmitting] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [minOrderValue, setMinOrderValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "CartDrawer.useEffect": ()=>{
            if (isCartOpen) {
                const fetchMinOrderValue = {
                    "CartDrawer.useEffect.fetchMinOrderValue": async ()=>{
                        try {
                            const apiUrl = ("TURBOPACK compile-time value", "http://localhost:5001") || "http://localhost:5000";
                            const res = await fetch(`${apiUrl}/api/settings/min-order-value/get`);
                            if (res.ok) {
                                const data = await res.json();
                                setMinOrderValue(Number(data.value) || 0);
                            }
                        } catch (e) {}
                    }
                }["CartDrawer.useEffect.fetchMinOrderValue"];
                fetchMinOrderValue();
            }
        }
    }["CartDrawer.useEffect"], [
        isCartOpen
    ]);
    if (!isCartOpen) return null;
    const handleConfirmOrder = async ()=>{
        const newErrors = {
            name: !customerName.trim(),
            phone: !customerPhone.trim(),
            email: customerEmail.trim() !== "" ? !customerEmail.includes('@') : false,
            city: !customerCity.trim(),
            address: !customerAddress.trim()
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
                items: cartItems.map((item)=>({
                        id: item.id,
                        name: item.name,
                        category: item.category,
                        price: item.price,
                        originalPrice: item.originalPrice,
                        quantity: item.quantity
                    }))
            };
            const apiUrl = ("TURBOPACK compile-time value", "http://localhost:5001") || "http://localhost:5000";
            const response = await fetch(`${apiUrl}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
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
            setErrors({
                name: false,
                phone: false,
                email: false,
                city: false,
                address: false
            });
            setShowSuccessPopup(true);
        } catch (error) {
            console.error('Error submitting order:', error);
            alert('There was a problem submitting your order. Please try again.');
        } finally{
            setIsSubmitting(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-['Outfit']",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity",
                onClick: ()=>setCartOpen(false)
            }, void 0, false, {
                fileName: "[project]/app/components/CartDrawer.tsx",
                lineNumber: 120,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative w-full max-w-2xl max-h-[90vh] bg-white border border-gray-100 rounded-3xl text-slate-800 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.15)] overflow-hidden animate-fadeIn",
                children: [
                    isSubmitting && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col justify-center items-center gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-12 h-12 border-4 border-festive-red border-t-transparent rounded-full animate-spin"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CartDrawer.tsx",
                                lineNumber: 131,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-bold text-slate-800 text-lg animate-pulse tracking-wide",
                                children: "Placing Your Order..."
                            }, void 0, false, {
                                fileName: "[project]/app/components/CartDrawer.tsx",
                                lineNumber: 132,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CartDrawer.tsx",
                        lineNumber: 130,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1/2 bg-festive-gold/5 blur-[80px] pointer-events-none rounded-full"
                    }, void 0, false, {
                        fileName: "[project]/app/components/CartDrawer.tsx",
                        lineNumber: 137,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-5 border-b border-gray-100 flex items-center justify-between relative z-10 bg-gray-50/50",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-2xl drop-shadow-sm",
                                        children: "🛒"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 142,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl font-black uppercase tracking-widest text-festive-purple",
                                        children: [
                                            "Your ",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "bg-clip-text text-transparent bg-gradient-to-r from-festive-red to-orange-500",
                                                children: "Cart"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CartDrawer.tsx",
                                                lineNumber: 144,
                                                columnNumber: 20
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "ml-3 text-xs bg-festive-gold/15 text-festive-purple border border-festive-gold/30 px-2.5 py-1 rounded-full relative -top-0.5 shadow-sm",
                                                children: [
                                                    cartCount,
                                                    " ITEMS"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/CartDrawer.tsx",
                                                lineNumber: 145,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 143,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/CartDrawer.tsx",
                                lineNumber: 141,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setCartOpen(false),
                                className: "w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-400 hover:text-festive-red hover:bg-red-50 hover:border-red-200 transition-all cursor-pointer shadow-sm",
                                children: "✕"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CartDrawer.tsx",
                                lineNumber: 150,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CartDrawer.tsx",
                        lineNumber: 140,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 overflow-y-auto scrollbar-hide px-6 py-6 space-y-5 relative z-10",
                        children: cartItems.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-col items-center justify-center h-full text-center space-y-6 py-10",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "w-28 h-28 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100 shadow-sm",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-6xl animate-pulse drop-shadow-sm",
                                        children: "✨"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 163,
                                        columnNumber: 17
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                    lineNumber: 162,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-slate-800 font-black uppercase tracking-widest text-lg mb-2",
                                            children: "Your cart is empty"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                            lineNumber: 166,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-base text-slate-500 max-w-sm mx-auto leading-relaxed font-medium",
                                            children: "Browse our premium fireworks catalog to add your favorite sparklers and sky shots!"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                            lineNumber: 169,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                    lineNumber: 165,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>setCartOpen(false),
                                    className: "px-10 py-3.5 rounded-full bg-gradient-to-r from-festive-gold to-yellow-400 text-festive-purple font-black text-base uppercase tracking-widest hover:scale-105 transition-all shadow-[0_8px_20px_rgba(255,215,0,0.4)] mt-4",
                                    children: "Start Shopping"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                    lineNumber: 173,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/CartDrawer.tsx",
                            lineNumber: 161,
                            columnNumber: 13
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "space-y-4",
                                    children: cartItems.map((item)=>{
                                        const discountPercent = item.originalPrice > 0 ? Math.round((item.originalPrice - item.price) / item.originalPrice * 100) : 0;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-5 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-festive-gold/30 transition-all group relative overflow-hidden items-center",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "relative w-24 h-24 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0 bg-gray-50 flex items-center justify-center p-2 group-hover:bg-amber-50/50 transition-colors duration-300",
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                        src: item.image || "/assets/images/placeholder.png",
                                                        alt: item.name,
                                                        className: "w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                                        lineNumber: 193,
                                                        columnNumber: 25
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                    lineNumber: 192,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex-1",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "text-[9px] uppercase font-bold text-slate-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200 inline-block mb-1.5",
                                                                    children: item.category
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                                    lineNumber: 203,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                    className: "text-base sm:text-base font-black text-slate-800 tracking-wide leading-tight group-hover:text-festive-purple transition-colors line-clamp-2",
                                                                    children: item.name
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                                    lineNumber: 206,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-3 mt-2",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-base font-black text-festive-purple drop-shadow-sm",
                                                                            children: [
                                                                                "₹",
                                                                                item.price
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                                            lineNumber: 211,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-xs text-slate-400 line-through font-bold",
                                                                            children: [
                                                                                "₹",
                                                                                item.originalPrice
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                                            lineNumber: 214,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                                    lineNumber: 210,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 202,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex items-center justify-between sm:flex-col sm:items-end gap-3 sm:gap-2",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center bg-gray-50 border border-gray-200 rounded-lg overflow-hidden group-hover:border-festive-gold/40 transition-colors shadow-sm",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>updateQuantity(item.id, item.quantity - 1),
                                                                            className: "px-3.5 py-2 text-base font-black text-slate-500 hover:bg-gray-100 hover:text-festive-red transition-colors cursor-pointer",
                                                                            children: "−"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                                            lineNumber: 223,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                            type: "number",
                                                                            value: item.quantity,
                                                                            onChange: (e)=>{
                                                                                const val = e.target.value === '' ? 0 : parseInt(e.target.value);
                                                                                if (!isNaN(val) && val >= 0) updateQuantity(item.id, val);
                                                                            },
                                                                            className: "px-2 py-2 w-12 text-base font-black text-center bg-white border-x border-gray-200 text-slate-900 shadow-inner outline-none focus:bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                                            lineNumber: 229,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>updateQuantity(item.id, item.quantity + 1),
                                                                            className: "px-3.5 py-2 text-base font-black text-slate-500 hover:bg-gray-100 hover:text-festive-purple transition-colors cursor-pointer",
                                                                            children: "+"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                                            lineNumber: 238,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                                    lineNumber: 222,
                                                                    columnNumber: 27
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex items-center gap-3",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                            className: "text-base font-black text-slate-900 hidden sm:block drop-shadow-sm",
                                                                            children: [
                                                                                "₹",
                                                                                item.price * item.quantity
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                                            lineNumber: 247,
                                                                            columnNumber: 29
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            onClick: ()=>removeFromCart(item.id),
                                                                            className: "text-festive-red bg-red-50 hover:bg-festive-red hover:text-white rounded-full w-8 h-8 flex items-center justify-center transition-all cursor-pointer flex-shrink-0",
                                                                            children: "✕"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                                            lineNumber: 250,
                                                                            columnNumber: 29
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                                    lineNumber: 246,
                                                                    columnNumber: 27
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 220,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                    lineNumber: 201,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, item.id, true, {
                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                            lineNumber: 187,
                                            columnNumber: 21
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                    lineNumber: 183,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "pt-4 pb-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setShowCheckoutForm(!showCheckoutForm),
                                            className: `w-full flex items-center justify-between text-sm sm:text-sm font-black uppercase tracking-wider p-4 rounded-xl transition-all border cursor-pointer ${showCheckoutForm ? 'bg-festive-gold/10 border-festive-gold/30 text-festive-purple shadow-sm' : 'bg-gray-50 border-gray-200 text-slate-600 hover:bg-gray-100 hover:border-gray-300'}`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: "flex items-center gap-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-lg",
                                                            children: "📋"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 271,
                                                            columnNumber: 21
                                                        }, this),
                                                        " Customer & Delivery Details"
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                    lineNumber: 270,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                    className: `transform transition-transform ${showCheckoutForm ? 'rotate-180' : ''}`,
                                                    children: "▼"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                    lineNumber: 273,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                            lineNumber: 266,
                                            columnNumber: 17
                                        }, this),
                                        showCheckoutForm && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 bg-gray-50 p-5 sm:p-6 rounded-xl border border-gray-200 animate-fadeIn shadow-inner",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-xs font-black uppercase tracking-widest text-slate-500",
                                                            children: "Full Name"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 279,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: customerName,
                                                            onChange: (e)=>{
                                                                setCustomerName(e.target.value);
                                                                if (errors.name) setErrors({
                                                                    ...errors,
                                                                    name: false
                                                                });
                                                            },
                                                            placeholder: "e.g. John Doe",
                                                            className: `w-full bg-white border ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-festive-gold focus:ring-festive-gold/20'} rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium shadow-sm`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 282,
                                                            columnNumber: 23
                                                        }, this),
                                                        errors.name && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-red-500 text-sm font-bold mt-1 block animate-fadeIn",
                                                            children: "* Full Name is required"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 289,
                                                            columnNumber: 39
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                    lineNumber: 278,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-1.5",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-xs font-black uppercase tracking-widest text-slate-500",
                                                            children: "Contact Number"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 292,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "tel",
                                                            value: customerPhone,
                                                            onChange: (e)=>{
                                                                setCustomerPhone(e.target.value);
                                                                if (errors.phone) setErrors({
                                                                    ...errors,
                                                                    phone: false
                                                                });
                                                            },
                                                            placeholder: "e.g. 9894116131",
                                                            className: `w-full bg-white border ${errors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-festive-gold focus:ring-festive-gold/20'} rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium shadow-sm`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 295,
                                                            columnNumber: 23
                                                        }, this),
                                                        errors.phone && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-red-500 text-sm font-bold mt-1 block animate-fadeIn",
                                                            children: "* Contact Number is required"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 302,
                                                            columnNumber: 40
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                    lineNumber: 291,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-1.5 sm:col-span-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-xs font-black uppercase tracking-widest text-slate-500",
                                                            children: "Email Address"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 305,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "email",
                                                            value: customerEmail,
                                                            onChange: (e)=>{
                                                                setCustomerEmail(e.target.value);
                                                                if (errors.email) setErrors({
                                                                    ...errors,
                                                                    email: false
                                                                });
                                                            },
                                                            placeholder: "e.g. name@example.com",
                                                            className: `w-full bg-white border ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-festive-gold focus:ring-festive-gold/20'} rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium shadow-sm`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 308,
                                                            columnNumber: 23
                                                        }, this),
                                                        errors.email && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-red-500 text-sm font-bold mt-1 block animate-fadeIn",
                                                            children: "* Please enter a valid email address"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 315,
                                                            columnNumber: 40
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                    lineNumber: 304,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-1.5 sm:col-span-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-xs font-black uppercase tracking-widest text-slate-500",
                                                            children: "Full Delivery Address"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 318,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("textarea", {
                                                            rows: 2,
                                                            value: customerAddress,
                                                            onChange: (e)=>{
                                                                setCustomerAddress(e.target.value);
                                                                if (errors.address) setErrors({
                                                                    ...errors,
                                                                    address: false
                                                                });
                                                            },
                                                            placeholder: "e.g. Street Name, Area, Pincode",
                                                            className: `w-full bg-white border ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-festive-gold focus:ring-festive-gold/20'} rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium resize-none shadow-sm`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 321,
                                                            columnNumber: 23
                                                        }, this),
                                                        errors.address && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-red-500 text-sm font-bold mt-1 block animate-fadeIn",
                                                            children: "* Address is required"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 328,
                                                            columnNumber: 42
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                    lineNumber: 317,
                                                    columnNumber: 21
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "space-y-1.5 sm:col-span-2",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                            className: "block text-xs font-black uppercase tracking-widest text-slate-500",
                                                            children: "Delivery City/Town"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 331,
                                                            columnNumber: 23
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            value: customerCity,
                                                            onChange: (e)=>{
                                                                setCustomerCity(e.target.value);
                                                                if (errors.city) setErrors({
                                                                    ...errors,
                                                                    city: false
                                                                });
                                                            },
                                                            placeholder: "e.g. Sivakasi",
                                                            className: `w-full bg-white border ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300 focus:border-festive-gold focus:ring-festive-gold/20'} rounded-lg px-4 py-3 text-base text-slate-900 focus:outline-none focus:ring-2 transition-all placeholder:text-gray-400 font-medium shadow-sm`
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 334,
                                                            columnNumber: 23
                                                        }, this),
                                                        errors.city && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                            className: "text-red-500 text-sm font-bold mt-1 block animate-fadeIn",
                                                            children: "* City/Town is required"
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                                            lineNumber: 341,
                                                            columnNumber: 39
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                                    lineNumber: 330,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                            lineNumber: 277,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/CartDrawer.tsx",
                                    lineNumber: 265,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true)
                    }, void 0, false, {
                        fileName: "[project]/app/components/CartDrawer.tsx",
                        lineNumber: 159,
                        columnNumber: 9
                    }, this),
                    cartItems.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "px-6 py-6 bg-gray-50/90 border-t border-gray-200 backdrop-blur-xl relative z-10 flex flex-col sm:flex-row gap-5 items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full sm:w-auto flex-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-end gap-4 mb-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-base font-black text-slate-500 uppercase tracking-wider pb-1",
                                                children: "Total:"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CartDrawer.tsx",
                                                lineNumber: 355,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-3xl font-black text-festive-purple drop-shadow-sm leading-none",
                                                children: [
                                                    "₹",
                                                    cartTotal
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/CartDrawer.tsx",
                                                lineNumber: 356,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 354,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-3 text-sm font-bold text-emerald-600",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Savings: ₹",
                                                    cartSavings
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/CartDrawer.tsx",
                                                lineNumber: 361,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-black shadow-sm",
                                                children: [
                                                    cartDiscountableOriginalTotal > 0 ? Math.round(cartSavings / cartDiscountableOriginalTotal * 100) : 0,
                                                    "% OFF"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/CartDrawer.tsx",
                                                lineNumber: 362,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 360,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/CartDrawer.tsx",
                                lineNumber: 353,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "w-full sm:w-auto flex gap-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: clearCart,
                                        title: "Clear all cart items",
                                        className: "w-14 h-14 rounded-xl border border-gray-200 bg-white text-slate-400 hover:text-festive-red hover:bg-red-50 hover:border-red-200 active:scale-95 transition-all flex items-center justify-center cursor-pointer flex-shrink-0 shadow-sm",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xl",
                                            children: "🗑️"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                            lineNumber: 374,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 369,
                                        columnNumber: 15
                                    }, this),
                                    minOrderValue > 0 && cartTotal < minOrderValue ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1 sm:px-6 h-14 rounded-xl bg-orange-50 text-orange-800 font-bold text-sm sm:text-base border border-orange-200 flex flex-col items-center justify-center text-center shadow-inner leading-tight",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "Min Order: ₹",
                                                    minOrderValue.toLocaleString('en-IN')
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/CartDrawer.tsx",
                                                lineNumber: 379,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xs text-orange-600 tracking-wide uppercase",
                                                children: [
                                                    "Add ₹",
                                                    (minOrderValue - cartTotal).toLocaleString('en-IN'),
                                                    " more"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/CartDrawer.tsx",
                                                lineNumber: 380,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 378,
                                        columnNumber: 17
                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: handleConfirmOrder,
                                        className: "flex-1 sm:px-8 h-14 rounded-xl bg-festive-red hover:bg-festive-gold text-white hover:text-festive-purple font-black text-base uppercase tracking-widest hover:scale-[1.03] active:scale-95 transition-all shadow-[0_8px_20px_rgba(220,38,38,0.25)] hover:shadow-[0_10px_25px_rgba(255,215,0,0.4)] border border-transparent hover:border-festive-gold cursor-pointer flex items-center justify-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-xl",
                                                children: "✨"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/CartDrawer.tsx",
                                                lineNumber: 387,
                                                columnNumber: 19
                                            }, this),
                                            " Confirm Order"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 383,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/CartDrawer.tsx",
                                lineNumber: 368,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CartDrawer.tsx",
                        lineNumber: 352,
                        columnNumber: 11
                    }, this),
                    showSuccessPopup && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 font-['Outfit']",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity"
                            }, void 0, false, {
                                fileName: "[project]/app/components/CartDrawer.tsx",
                                lineNumber: 397,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "relative bg-white border border-gray-100 p-8 rounded-3xl max-w-sm w-full text-center shadow-2xl animate-fadeIn transform scale-100",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "w-24 h-24 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-200 shadow-sm",
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-5xl",
                                            children: "✅"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/CartDrawer.tsx",
                                            lineNumber: 400,
                                            columnNumber: 17
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 399,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                        className: "text-2xl font-black text-slate-900 uppercase tracking-widest mb-3",
                                        children: "Order Confirmed"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 402,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-slate-600 leading-relaxed font-medium mb-8 text-base sm:text-base",
                                        children: "Thank you for placing your order! Our team will contact you shortly to confirm the details."
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 403,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>{
                                            setShowSuccessPopup(false);
                                            clearCart();
                                            setCartOpen(false);
                                        },
                                        className: "w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-base uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-[0_8px_20px_rgba(16,185,129,0.25)]",
                                        children: "Done"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/CartDrawer.tsx",
                                        lineNumber: 406,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/CartDrawer.tsx",
                                lineNumber: 398,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/CartDrawer.tsx",
                        lineNumber: 396,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/CartDrawer.tsx",
                lineNumber: 126,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/CartDrawer.tsx",
        lineNumber: 118,
        columnNumber: 5
    }, this);
}
_s(CartDrawer, "3fxCdYEAaRIGc3nrMWuUqDxKZXY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$context$2f$CartContext$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCart"]
    ];
});
_c = CartDrawer;
var _c;
__turbopack_context__.k.register(_c, "CartDrawer");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_f4cf8eaa._.js.map