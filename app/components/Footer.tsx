'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function Footer() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.1 }
        );

        const footer = document.getElementById('premium-footer');
        if (footer) observer.observe(footer);

        return () => observer.disconnect();
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const quickLinks = [
        { name: 'Home', href: '/', isLink: true },
        { name: 'Products', href: '/products', isLink: true },
        { name: 'Safety Tips', href: '/#safety-tips', isLink: false },
        { name: 'About Us', href: '/#about-us', isLink: false },
        { name: 'Contact Us', href: '/#contact', isLink: false },
    ];

    return (
        <footer id="premium-footer" className="relative bg-gradient-to-br from-[#2a0845] via-[#4a1c6a] to-[#2a0845] text-white overflow-hidden">
            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* Animated Background Layers */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* Large ambient glows */}
                <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-festive-purple/25 rounded-full blur-[180px] animate-pulse" />
                <div className="absolute -bottom-60 -right-40 w-[500px] h-[500px] bg-festive-gold/8 rounded-full blur-[150px]" />
                <div className="absolute top-1/2 left-1/3 w-[350px] h-[350px] bg-festive-red/6 rounded-full blur-[130px]" />
                <div className="absolute top-20 right-1/4 w-[250px] h-[250px] bg-violet-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />

                {/* Subtle grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(255,215,0,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,215,0,0.3) 1px, transparent 1px)`,
                        backgroundSize: '60px 60px'
                    }}
                />

                {/* Floating sparkle particles */}
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-festive-gold/40 rounded-full animate-pulse"
                        style={{
                            left: `${15 + i * 15}%`,
                            top: `${20 + (i % 3) * 25}%`,
                            animationDelay: `${i * 0.7}s`,
                            animationDuration: `${2 + i * 0.5}s`
                        }}
                    />
                ))}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* Premium Top Accent - Multi-layered golden border */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="relative">
                <div className="h-[1px] bg-gradient-to-r from-transparent via-festive-gold/50 to-transparent" />
                <div className="h-[2px] bg-gradient-to-r from-transparent via-festive-gold/80 to-transparent shadow-[0_0_30px_rgba(255,215,0,0.5)]" />
                <div className="h-[1px] bg-gradient-to-r from-transparent via-festive-gold/30 to-transparent" />
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* CTA Banner Section */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="relative z-10">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-16 pb-12">
                    <div className={`relative rounded-3xl overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                        {/* CTA Background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-festive-purple via-[#1a0a35] to-festive-purple" />
                        <div className="absolute inset-0 bg-gradient-to-b from-festive-gold/5 to-transparent" />
                        <div className="absolute inset-[1px] rounded-3xl border border-festive-gold/20" />

                        {/* Animated shimmer */}
                        <div className="absolute inset-0 overflow-hidden">
                            <div
                                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] animate-spin"
                                style={{
                                    background: 'conic-gradient(from 0deg, transparent, rgba(255,215,0,0.03), transparent, transparent)',
                                    animationDuration: '15s'
                                }}
                            />
                        </div>

                        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 p-8 lg:p-12">
                            {/* CTA Text */}
                            <div className="text-center lg:text-left">
                                <div className="inline-flex items-center gap-2 bg-festive-gold/10 border border-festive-gold/20 rounded-full px-4 py-1.5 mb-4">
                                    <span className="w-2 h-2 bg-festive-gold rounded-full animate-pulse" />
                                    <span className="text-[11px] font-bold text-festive-gold uppercase tracking-[0.2em]">Diwali Season Open</span>
                                </div>
                                <h3 className="text-2xl lg:text-3xl font-black leading-tight">
                                    Ready to Light Up Your{' '}
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-festive-gold via-yellow-200 to-festive-gold">
                                        Celebrations?
                                    </span>
                                </h3>
                                <p className="text-gray-400 text-sm mt-3 max-w-md font-medium">
                                    Get the best Sivakasi crackers at wholesale prices. Direct from factory to your doorstep!
                                </p>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <a
                                    href="https://wa.me/919080019031"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-2xl font-bold text-white text-sm tracking-wide shadow-[0_8px_30px_rgba(37,211,102,0.3)] hover:shadow-[0_12px_40px_rgba(37,211,102,0.5)] hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 relative z-10">
                                        <path d="M11.99 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.98.58 3.82 1.58 5.37l-1.57 4.6 4.77-1.22c1.51.91 3.28 1.44 5.17 1.44 5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zm0 18.27c-1.63 0-3.17-.42-4.51-1.16l-.32-.18-3.04.78 1.01-2.92-.2-.33c-.78-1.29-1.24-2.82-1.24-4.45 0-4.58 3.73-8.31 8.31-8.31s8.31 3.73 8.31 8.31-3.73 8.31-8.31 8.31zm4.56-6.19c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.57.13-.17.25-.65.81-.8.98-.15.17-.3.19-.55.06-1.5-.78-2.67-1.5-3.69-2.93-.11-.16.02-.24.14-.36.11-.11.25-.29.37-.44.08-.1.13-.17.21-.33.1-.21.05-.39-.02-.52-.16-.27-.57-1.38-.78-1.89-.21-.5-.42-.43-.57-.44H7.2c-.2 0-.52.08-.79.37s-1.04 1.02-1.04 2.48 1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49 2.21.96 2.92 1.04 3.96.88.94-.15 2.53-1.04 2.89-2.04.36-1.01.36-1.87.25-2.04-.11-.18-.4-.28-.65-.4z"/>
                                    </svg>
                                    <span className="relative z-10">Order on WhatsApp</span>
                                </a>
                                <a
                                    href="tel:+919080019031"
                                    className="group flex items-center gap-3 px-8 py-4 bg-white/[0.04] border border-white/10 rounded-2xl font-bold text-white text-sm tracking-wide hover:bg-white/[0.08] hover:border-festive-gold/30 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-festive-gold group-hover:animate-bounce">
                                        <path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" />
                                    </svg>
                                    <span>Call Now</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* Main Footer Content */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12 pb-8">

                {/* Brand + Social Row */}
                <div className={`flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-14 pb-14 border-b border-white/[0.06] transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                    {/* Brand */}
                    <div className="flex items-center gap-5 group cursor-pointer">
                        <div className="relative w-[76px] h-[76px] rounded-2xl overflow-hidden border-2 border-festive-gold/50 shadow-[0_0_40px_rgba(255,215,0,0.15)] bg-white p-1.5 group-hover:shadow-[0_0_60px_rgba(255,215,0,0.35)] group-hover:border-festive-gold/80 transition-all duration-700">
                            <Image
                                src="/assets/images/vamsi_crackers_logo.png"
                                alt="Vamsi Crackers Logo"
                                fill
                                className="object-contain group-hover:scale-110 transition-transform duration-700"
                            />
                        </div>
                        <div>
                            <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight leading-none">
                                Vamsi{' '}
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-festive-gold via-yellow-200 to-festive-gold">
                                    Crackers
                                </span>
                            </h2>
                            <p className="text-[10px] text-festive-gold/60 font-bold tracking-[0.35em] uppercase mt-1.5">
                                Sivakasi&apos;s Finest Since 2024
                            </p>
                        </div>
                    </div>

                    {/* Social Icons - Glassmorphism style */}
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-300 uppercase tracking-[0.2em] mr-2 hidden sm:block">
                            Follow Us
                        </span>
                        {[
                            {
                                href: 'https://youtube.com/@vamsi_crackers24?si=Y3vpXD02Rlq4mS-B',
                                title: 'YouTube',
                                hoverBg: 'hover:bg-red-500/15 hover:border-red-500/40 hover:shadow-[0_0_30px_rgba(239,68,68,0.2)]',
                                hoverText: 'group-hover:text-red-400',
                                icon: <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.546 12 3.546 12 3.546s-7.505 0-9.377.504A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.504 9.376.504 9.376.504s7.505 0 9.377-.504a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                            },
                            {
                                href: 'https://www.instagram.com/vamsi_crackers/profilecard/?igsh=bGo5NnZqeWN4OWFq',
                                title: 'Instagram',
                                hoverBg: 'hover:bg-gradient-to-br hover:from-purple-500/15 hover:via-pink-500/15 hover:to-orange-400/15 hover:border-pink-500/40 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]',
                                hoverText: 'group-hover:text-pink-400',
                                icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            },
                            {
                                href: 'https://www.facebook.com/share/19fvU2TpPK/',
                                title: 'Facebook',
                                hoverBg: 'hover:bg-blue-600/15 hover:border-blue-500/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
                                hoverText: 'group-hover:text-blue-400',
                                icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                            },
                            {
                                href: 'https://wa.me/919080019031',
                                title: 'WhatsApp',
                                hoverBg: 'hover:bg-[#25D366]/15 hover:border-[#25D366]/40 hover:shadow-[0_0_30px_rgba(37,211,102,0.2)]',
                                hoverText: 'group-hover:text-[#25D366]',
                                icon: <path d="M11.99 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.98.58 3.82 1.58 5.37l-1.57 4.6 4.77-1.22c1.51.91 3.28 1.44 5.17 1.44 5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zm0 18.27c-1.63 0-3.17-.42-4.51-1.16l-.32-.18-3.04.78 1.01-2.92-.2-.33c-.78-1.29-1.24-2.82-1.24-4.45 0-4.58 3.73-8.31 8.31-8.31s8.31 3.73 8.31 8.31-3.73 8.31-8.31 8.31zm4.56-6.19c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.57.13-.17.25-.65.81-.8.98-.15.17-.3.19-.55.06-1.5-.78-2.67-1.5-3.69-2.93-.11-.16.02-.24.14-.36.11-.11.25-.29.37-.44.08-.1.13-.17.21-.33.1-.21.05-.39-.02-.52-.16-.27-.57-1.38-.78-1.89-.21-.5-.42-.43-.57-.44H7.2c-.2 0-.52.08-.79.37s-1.04 1.02-1.04 2.48 1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49 2.21.96 2.92 1.04 3.96.88.94-.15 2.53-1.04 2.89-2.04.36-1.01.36-1.87.25-2.04-.11-.18-.4-.28-.65-.4z" />
                            }
                        ].map((social, i) => (
                            <a
                                key={social.title}
                                href={social.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={`group relative w-12 h-12 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center ${social.hoverBg} transition-all duration-500 hover:-translate-y-1.5 hover:scale-105`}
                                title={social.title}
                                style={{ transitionDelay: `${i * 50}ms` }}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-5 h-5 text-gray-300 ${social.hoverText} transition-colors duration-300`}>
                                    {social.icon}
                                </svg>
                            </a>
                        ))}
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* Main Grid: 4 columns */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-10 gap-y-14 mb-16 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

                    {/* Column 1: About */}
                    <div className="lg:col-span-5 space-y-6">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                            <span className="w-8 h-[2px] bg-gradient-to-r from-festive-gold to-transparent rounded-full" />
                            <span className="w-1.5 h-1.5 bg-festive-gold rounded-full" />
                            About Us
                        </h3>
                        <p className="text-gray-200 text-base leading-[1.9] font-medium">
                            Bringing the magic of fireworks directly from the heart of{' '}
                            <span className="text-white font-bold relative">
                                Sivakasi
                                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-festive-gold/30" />
                            </span>{' '}
                            to your doorstep. We promise premium quality, unbeatable prices, and the highest safety standards in every product.
                        </p>
                        {/* Premium Trust Badges */}
                        <div className="flex flex-wrap gap-2.5 pt-3">
                            {[
                                { icon: '🏭', text: 'Factory Direct' },
                                { icon: '✅', text: 'Safety Certified' },
                                { icon: '🚚', text: 'All India Delivery' }
                            ].map((badge) => (
                                <span
                                    key={badge.text}
                                    className="group text-xs font-bold text-gray-300 bg-white/[0.05] border border-white/[0.1] rounded-xl px-4 py-2.5 tracking-wider uppercase flex items-center gap-1.5 hover:bg-festive-gold/10 hover:border-festive-gold/30 hover:text-white transition-all duration-300 cursor-default shadow-sm"
                                >
                                    <span className="text-base group-hover:scale-110 transition-transform">{badge.icon}</span>
                                    {badge.text}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div className="lg:col-span-3 lg:pl-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 mb-7">
                            <span className="w-8 h-[2px] bg-gradient-to-r from-festive-gold to-transparent rounded-full" />
                            <span className="w-1.5 h-1.5 bg-festive-gold rounded-full" />
                            Quick Links
                        </h3>
                        <ul className="space-y-2">
                            {quickLinks.map((item, index) => (
                                <li key={item.name}>
                                    {item.isLink ? (
                                        <Link
                                            href={item.href}
                                            className="group flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 font-semibold text-base py-2.5 px-3 -mx-3 rounded-xl hover:bg-white/[0.06]"
                                        >
                                            <span className="w-0 group-hover:w-5 h-[2px] bg-gradient-to-r from-festive-gold to-transparent transition-all duration-300 rounded-full" />
                                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                                                {item.name}
                                            </span>
                                        </Link>
                                    ) : (
                                        <a
                                            href={item.href}
                                            className="group flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 font-semibold text-base py-2.5 px-3 -mx-3 rounded-xl hover:bg-white/[0.06]"
                                        >
                                            <span className="w-0 group-hover:w-5 h-[2px] bg-gradient-to-r from-festive-gold to-transparent transition-all duration-300 rounded-full" />
                                            <span className="group-hover:translate-x-1 transition-transform duration-300">
                                                {item.name}
                                            </span>
                                        </a>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Column 3: Showroom - Premium Card */}
                    <div className="lg:col-span-4">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 mb-7">
                            <span className="w-8 h-[2px] bg-gradient-to-r from-festive-gold to-transparent rounded-full" />
                            <span className="w-1.5 h-1.5 bg-festive-gold rounded-full" />
                            Showroom
                        </h3>
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/[0.1] space-y-6 hover:border-white/[0.2] transition-all duration-500 shadow-[0_8px_32px_rgba(0,0,0,0.15)]">
                            {/* Map pin & address */}
                            <div className="flex items-start gap-5">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-festive-red/40 to-festive-red/10 flex items-center justify-center flex-shrink-0 mt-0.5 shadow-[0_0_25px_rgba(185,28,28,0.2)]">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-red-400">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-base md:text-lg leading-snug">
                                        Kavulur Veeracheliapuram,<br />Sivakasi
                                    </p>
                                    <p className="text-gray-300 text-[15px] font-medium mt-2">Tamil Nadu 626005, India</p>
                                </div>
                            </div>

                            {/* Elegant divider */}
                            <div className="relative h-[1px]">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.15] to-transparent" />
                            </div>

                            {/* Open status badge */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                                    </span>
                                    <span className="text-xs font-black text-green-400 uppercase tracking-[0.15em]">
                                        Open for Diwali Season
                                    </span>
                                </div>
                            </div>

                            {/* Timing info */}
                            <div className="flex items-center gap-3 bg-white/[0.05] rounded-xl p-4 border border-white/[0.08]">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-300 flex-shrink-0">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-[13px] sm:text-sm font-bold text-gray-200">Mon - Sun: 8:00 AM – 9:00 PM</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ═══════════════════════════════════════════════════════════════ */}
                {/* Bottom Bar */}
                {/* ═══════════════════════════════════════════════════════════════ */}
                <div className={`relative pt-8 transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                    {/* Premium gradient divider */}
                    <div className="absolute top-0 left-0 right-0">
                        <div className="h-[1px] bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                    </div>

                    <div className="flex justify-center items-center mt-6">
                        <p className="text-gray-400 text-sm font-semibold tracking-wider text-center">
                            © 2026{' '}
                            <span className="text-gray-300">Vamsi Crackers</span>. All rights reserved.
                        </p>
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* Scroll to Top - Ultra Premium */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            <button
                onClick={scrollToTop}
                className="absolute bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-festive-gold via-yellow-400 to-festive-gold text-festive-purple rounded-xl flex items-center justify-center shadow-[0_8px_30px_rgba(255,215,0,0.25)] hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(255,215,0,0.4)] transition-all duration-500 group z-20 border border-yellow-300/30"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform duration-300">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
            </button>
        </footer>
    );
}
