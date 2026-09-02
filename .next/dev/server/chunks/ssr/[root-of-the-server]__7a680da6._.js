module.exports = [
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/http [external] (http, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http", () => require("http"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/tty [external] (tty, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tty", () => require("tty"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[project]/app/components/FireworksCanvas.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>FireworksCanvas
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function FireworksCanvas() {
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId;
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        const isMobile = width < 768;
        const handleResize = ()=>{
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        // Exploding Particle class
        class Particle {
            x;
            y;
            vx;
            vy;
            alpha;
            decay;
            color;
            gravity;
            friction;
            constructor(x, y, color){
                this.x = x;
                this.y = y;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * (isMobile ? 3.5 : 5) + 1.5;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.alpha = 1;
                this.decay = Math.random() * (isMobile ? 0.018 : 0.012) + (isMobile ? 0.018 : 0.012);
                this.color = color;
                this.gravity = 0.05;
                this.friction = 0.98;
            }
            update() {
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
            }
            draw(c) {
                c.save();
                c.globalAlpha = this.alpha;
                c.beginPath();
                c.arc(this.x, this.y, isMobile ? 1.5 : 2, 0, Math.PI * 2);
                c.fillStyle = this.color;
                if (!isMobile) {
                    c.shadowBlur = 6;
                    c.shadowColor = this.color;
                }
                c.fill();
                c.restore();
            }
        }
        // Rocket class
        class Rocket {
            x;
            y;
            tx;
            ty;
            vx;
            vy;
            color;
            exploded;
            constructor(sx, sy, tx, ty, color){
                this.x = sx;
                this.y = sy;
                this.tx = tx;
                this.ty = ty;
                const dx = tx - sx;
                const dy = ty - sy;
                const angle = Math.atan2(dy, dx);
                const speed = Math.random() * 4 + 7;
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.color = color;
                this.exploded = false;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                // Explode when moving downwards or passing height threshold
                if (this.vy >= 0 || this.y <= this.ty) {
                    this.exploded = true;
                }
            }
            draw(c) {
                c.save();
                c.beginPath();
                c.arc(this.x, this.y, isMobile ? 2 : 2.5, 0, Math.PI * 2);
                c.fillStyle = this.color;
                if (!isMobile) {
                    c.shadowBlur = 8;
                    c.shadowColor = this.color;
                }
                c.fill();
                c.restore();
            }
        }
        let rockets = [];
        let particles = [];
        const colors = [
            '#fdb931',
            '#a855f7',
            '#f59e0b',
            '#ec4899',
            '#3b82f6',
            '#10b981',
            '#ef4444'
        ];
        const spawnFirework = ()=>{
            const sx = Math.random() * width;
            const sy = height;
            const tx = Math.random() * (width * 0.8) + width * 0.1;
            const ty = Math.random() * (height * 0.45) + height * 0.1;
            const color = colors[Math.floor(Math.random() * colors.length)];
            rockets.push(new Rocket(sx, sy, tx, ty, color));
        };
        const animate = ()=>{
            // Create trailing blur overlay
            ctx.fillStyle = 'rgba(13, 4, 21, 0.16)';
            ctx.fillRect(0, 0, width, height);
            // Random launch spawn logic
            if (Math.random() < (isMobile ? 0.025 : 0.03) && rockets.length < (isMobile ? 2 : 4)) {
                spawnFirework();
            }
            // Update rockets
            rockets = rockets.filter((r)=>{
                r.update();
                r.draw(ctx);
                if (r.exploded) {
                    // Create bursts of sparks
                    const numParticles = isMobile ? Math.floor(Math.random() * 15) + 15 : Math.floor(Math.random() * 40) + 40;
                    for(let i = 0; i < numParticles; i++){
                        particles.push(new Particle(r.x, r.y, r.color));
                    }
                    return false;
                }
                return true;
            });
            // Update particles
            particles = particles.filter((p)=>{
                p.update();
                p.draw(ctx);
                return p.alpha > 0;
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return ()=>{
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
        ref: canvasRef,
        className: "absolute inset-0 w-full h-full pointer-events-none z-0",
        style: {
            mixBlendMode: 'screen'
        }
    }, void 0, false, {
        fileName: "[project]/app/components/FireworksCanvas.tsx",
        lineNumber: 184,
        columnNumber: 10
    }, this);
}
}),
"[project]/app/components/LoginTransition.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginTransition
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
'use client';
;
;
function LoginTransition() {
    const canvasRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const [isClosing, setIsClosing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        // Trigger closing slide-out phase at 1.9 seconds
        const timer = setTimeout(()=>{
            setIsClosing(true);
        }, 1900);
        return ()=>clearTimeout(timer);
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId;
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        const handleResize = ()=>{
            if (!canvas) return;
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        };
        window.addEventListener('resize', handleResize);
        class Particle {
            x;
            y;
            vx;
            vy;
            alpha;
            decay;
            color;
            gravity;
            friction;
            size;
            constructor(x, y, color){
                this.x = x;
                this.y = y;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 8 + 2; // High-velocity burst
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.alpha = 1;
                this.decay = Math.random() * 0.015 + 0.01;
                this.color = color;
                this.gravity = 0.07;
                this.friction = 0.96;
                this.size = Math.random() * 2.5 + 1.5;
            }
            update() {
                this.vx *= this.friction;
                this.vy *= this.friction;
                this.vy += this.gravity;
                this.x += this.vx;
                this.y += this.vy;
                this.alpha -= this.decay;
            }
            draw(c) {
                c.save();
                c.globalAlpha = this.alpha;
                c.beginPath();
                c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                c.fillStyle = this.color;
                c.shadowBlur = 10;
                c.shadowColor = this.color;
                c.fill();
                c.restore();
            }
        }
        class Rocket {
            x;
            y;
            tx;
            ty;
            vx;
            vy;
            color;
            exploded;
            constructor(sx, sy, tx, ty, color){
                this.x = sx;
                this.y = sy;
                this.tx = tx;
                this.ty = ty;
                const dx = tx - sx;
                const dy = ty - sy;
                const angle = Math.atan2(dy, dx);
                const speed = Math.random() * 5 + 12; // Fast launch
                this.vx = Math.cos(angle) * speed;
                this.vy = Math.sin(angle) * speed;
                this.color = color;
                this.exploded = false;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.vy >= 0 || this.y <= this.ty) {
                    this.exploded = true;
                }
            }
            draw(c) {
                c.save();
                c.beginPath();
                c.arc(this.x, this.y, 3, 0, Math.PI * 2);
                c.fillStyle = this.color;
                c.shadowBlur = 12;
                c.shadowColor = this.color;
                c.fill();
                c.restore();
            }
        }
        const playExplosionSound = ()=>{
            const audio = new Audio('/assets/audio/bomb.mp3');
            audio.volume = 0.25; // Gentle volume to avoid being too loud
            audio.play().catch(()=>{
            // Autoplay guard catch
            });
        };
        let rockets = [];
        let particles = [];
        const colors = [
            '#fdb931',
            '#a855f7',
            '#f59e0b',
            '#ec4899',
            '#3b82f6',
            '#10b981',
            '#ef4444'
        ];
        // Spawn massive multi-rocket launch on mount immediately
        const triggerInitialBurst = ()=>{
            const sxLeft = width * 0.2;
            const sxRight = width * 0.8;
            const sxCenter = width * 0.5;
            const targets = [
                {
                    tx: width * 0.35,
                    ty: height * 0.3
                },
                {
                    tx: width * 0.5,
                    ty: height * 0.35
                },
                {
                    tx: width * 0.65,
                    ty: height * 0.3
                },
                {
                    tx: width * 0.42,
                    ty: height * 0.45
                },
                {
                    tx: width * 0.58,
                    ty: height * 0.45
                }
            ];
            targets.forEach((target, index)=>{
                const sx = index % 3 === 0 ? sxLeft : index % 3 === 1 ? sxRight : sxCenter;
                const color = colors[index % colors.length];
                rockets.push(new Rocket(sx, height, target.tx, target.ty, color));
            });
        };
        triggerInitialBurst();
        const animate = ()=>{
            ctx.fillStyle = 'rgba(12, 4, 21, 0.18)';
            ctx.fillRect(0, 0, width, height);
            // Keep spawning random mini fireworks in background
            if (Math.random() < 0.05 && rockets.length < 3) {
                const sx = Math.random() * width;
                const tx = Math.random() * (width * 0.6) + width * 0.2;
                const ty = Math.random() * (height * 0.5) + height * 0.1;
                const color = colors[Math.floor(Math.random() * colors.length)];
                rockets.push(new Rocket(sx, height, tx, ty, color));
            }
            rockets = rockets.filter((r)=>{
                r.update();
                r.draw(ctx);
                if (r.exploded) {
                    playExplosionSound();
                    const numParticles = Math.floor(Math.random() * 60) + 60; // Denser explosions
                    for(let i = 0; i < numParticles; i++){
                        particles.push(new Particle(r.x, r.y, r.color));
                    }
                    return false;
                }
                return true;
            });
            particles = particles.filter((p)=>{
                p.update();
                p.draw(ctx);
                return p.alpha > 0;
            });
            animationFrameId = requestAnimationFrame(animate);
        };
        animate();
        return ()=>{
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `fixed inset-0 z-[9999] bg-[#0c0415] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ${isClosing ? 'animate-portal-unlock' : ''}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("canvas", {
                ref: canvasRef,
                className: "absolute inset-0 w-full h-full pointer-events-none z-0"
            }, void 0, false, {
                fileName: "[project]/app/components/LoginTransition.tsx",
                lineNumber: 214,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative z-10 text-center select-none pointer-events-none px-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-festive-gold/60 to-pink-500/60 rounded-full flex items-center justify-center border-2 border-festive-gold shadow-[0_0_50px_rgba(253,185,49,0.5)] animate-bounce",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-5xl animate-pulse",
                            children: "🔑"
                        }, void 0, false, {
                            fileName: "[project]/app/components/LoginTransition.tsx",
                            lineNumber: 219,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/LoginTransition.tsx",
                        lineNumber: 218,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-3xl md:text-5xl font-semibold uppercase tracking-[0.2em] bg-gradient-to-r from-festive-gold via-pink-500 to-festive-gold bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(253,185,49,0.4)] animate-pulse",
                        children: "Access Granted"
                    }, void 0, false, {
                        fileName: "[project]/app/components/LoginTransition.tsx",
                        lineNumber: 222,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-gray-400 text-sm md:text-sm mt-3 font-bold uppercase tracking-[0.4em] text-festive-gold/80 animate-pulse",
                        children: "Launching Control Portal..."
                    }, void 0, false, {
                        fileName: "[project]/app/components/LoginTransition.tsx",
                        lineNumber: 226,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/LoginTransition.tsx",
                lineNumber: 216,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/LoginTransition.tsx",
        lineNumber: 209,
        columnNumber: 5
    }, this);
}
}),
"[project]/app/admin/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/app/admin/page.tsx'\n\nExpected ',', got ':'");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__7a680da6._.js.map