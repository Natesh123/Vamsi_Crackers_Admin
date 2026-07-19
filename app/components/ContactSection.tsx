'use client';

import React, { useState, useEffect } from 'react';

export default function ContactSection() {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => setToast(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !phone.trim() || !message.trim()) {
            setToast({ message: 'All fields are required', type: 'error' });
            return;
        }

        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length < 10) {
            setToast({ message: 'Please enter a valid 10-digit phone number', type: 'error' });
            return;
        }

        setSubmitting(true);
        setToast(null);

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
            const res = await fetch(`${apiUrl}/api/contacts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, message }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send message');

            setToast({ message: 'Message sent successfully! We will contact you soon.', type: 'success' });
            setName('');
            setPhone('');
            setMessage('');
        } catch (err: any) {
            setToast({ message: err.message || 'Failed to send message. Please try again.', type: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section id="contact" className="bg-[#f8f9fa] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-[size:24px_24px] py-24 relative overflow-hidden">
            {/* Background dynamic ambient orbs */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-festive-purple/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-[800px] h-[800px] bg-festive-gold/10 rounded-full blur-[120px] pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
            <div className="absolute top-[30%] left-[40%] w-[600px] h-[600px] bg-blue-400/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 relative z-20">
                
                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
                    <h2 className="text-5xl lg:text-6xl font-black text-gray-900 tracking-tight mb-6">
                        Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-festive-purple to-festive-red">Us</span>
                    </h2>
                    <p className="text-gray-500 font-medium text-lg lg:text-xl">
                        We'd love to hear from you. Get in touch with us for any inquiries, bulk orders, or support.
                    </p>
                </div>

                {/* Premium Frosted Glass Bento Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
                    
                    {/* 1. Header Area (Spans 4 cols on XL) */}
                    <div className="xl:col-span-4 md:col-span-2 flex flex-col justify-center p-8 lg:p-10 rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-festive-purple/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-1000"></div>
                        
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-festive-purple/5 text-festive-purple font-bold uppercase tracking-widest text-xs mb-8 w-max border border-festive-purple/10 shadow-sm backdrop-blur-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-festive-red animate-pulse"></span>
                            Get in touch
                        </div>
                        <h2 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight mb-5 leading-[1.15]">
                            Let's start a <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-festive-purple via-festive-red to-orange-500">conversation.</span>
                        </h2>
                        <p className="text-gray-500 font-medium text-lg leading-relaxed max-w-sm">
                            Have questions about our premium crackers or bulk orders? Our team is ready to assist you immediately.
                        </p>
                    </div>

                    {/* 2. Direct Support Line (Spans 4 cols on XL) */}
                    <div className="xl:col-span-4 md:col-span-1 p-8 lg:p-10 rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex flex-col group hover:border-festive-purple/40 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-br from-festive-purple/10 to-festive-red/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000"></div>
                        
                        {/* Premium Header Profile */}
                        <div className="flex items-center gap-4 mb-8 relative z-10 bg-gradient-to-r from-gray-50 to-white p-3 pr-6 rounded-2xl border border-gray-100 shadow-sm w-max group-hover:shadow-md transition-shadow">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-festive-purple to-festive-red flex items-center justify-center text-white font-black text-xl shadow-inner">
                                SN
                            </div>
                            <div>
                                <span className="text-[9px] font-bold text-festive-purple uppercase tracking-[0.2em] block mb-0.5">Proprietor</span>
                                <p className="text-lg font-black text-gray-900 leading-none">S. Natesh Kumar</p>
                            </div>
                        </div>

                        <div className="mt-auto w-full relative z-10 flex flex-col items-center justify-center py-6">
                             <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                                <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse"></span>
                                Available Now
                             </span>
                             <a href="tel:+919894116131" className="block text-2xl sm:text-3xl xl:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 to-gray-700 hover:from-festive-purple hover:to-festive-red hover:scale-105 transition-all duration-300 drop-shadow-sm tracking-tight">
                                +91 98941 16131
                             </a>
                        </div>
                        
                        <div className="w-full flex gap-3 mt-8 relative z-10">
                            <a href="tel:+919894116131" className="flex-1 py-3 sm:py-4 rounded-xl bg-gray-900 text-white font-black text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-festive-purple hover:shadow-[0_10px_20px_rgba(88,28,135,0.25)] transition-all duration-300 shadow-md flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z" clipRule="evenodd" /></svg>
                                Call
                            </a>
                            <a href="https://wa.me/919894116131" target="_blank" rel="noreferrer" className="flex-1 py-3 sm:py-4 rounded-xl bg-[#25D366] text-white font-black text-center text-[10px] sm:text-xs uppercase tracking-[0.2em] hover:bg-[#1DA851] hover:shadow-[0_10px_20px_rgba(37,211,102,0.3)] transition-all duration-300 shadow-md flex items-center justify-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M11.99 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.98.58 3.82 1.58 5.37l-1.57 4.6 4.77-1.22c1.51.91 3.28 1.44 5.17 1.44 5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zm0 18.27c-1.63 0-3.17-.42-4.51-1.16l-.32-.18-3.04.78 1.01-2.92-.2-.33c-.78-1.29-1.24-2.82-1.24-4.45 0-4.58 3.73-8.31 8.31-8.31s8.31 3.73 8.31 8.31-3.73 8.31-8.31 8.31zm4.56-6.19c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.57.13-.17.25-.65.81-.8.98-.15.17-.3.19-.55.06-1.5-.78-2.67-1.5-3.69-2.93-.11-.16.02-.24.14-.36.11-.11.25-.29.37-.44.08-.1.13-.17.21-.33.1-.21.05-.39-.02-.52-.16-.27-.57-1.38-.78-1.89-.21-.5-.42-.43-.57-.44H7.2c-.2 0-.52.08-.79.37s-1.04 1.02-1.04 2.48 1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.09 4.49 2.21.96 2.92 1.04 3.96.88.94-.15 2.53-1.04 2.89-2.04.36-1.01.36-1.87.25-2.04-.11-.18-.4-.28-.65-.4z"/></svg>
                                WhatsApp
                            </a>
                        </div>
                    </div>

                    {/* 3. Official Showroom (Spans 4 cols on XL) */}
                    <div className="xl:col-span-4 md:col-span-1 p-8 lg:p-10 rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] flex flex-col items-start group hover:border-festive-red/30 transition-all duration-500 relative overflow-hidden">
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-festive-red/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                        
                        <div className="w-16 h-16 rounded-2xl bg-festive-red flex items-center justify-center text-white mb-8 group-hover:scale-110 transition-all duration-500 shadow-md">
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                               <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                             </svg>
                        </div>
                        <h3 className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-4 relative z-10">Official Showroom</h3>
                        <div className="mt-auto w-full relative z-10">
                            <p className="text-2xl font-black text-gray-900 leading-tight mb-1">Kavulur Veeracheliapuram,</p>
                            <p className="text-2xl font-black text-gray-900 leading-tight mb-4">Sivakasi</p>
                            <p className="text-gray-500 font-medium">Tamil Nadu 626005, India</p>
                        </div>
                        <div className="w-full mt-8 relative z-10">
                             <a href="#map" className="block w-full py-3.5 rounded-xl bg-festive-red text-white font-black text-center text-xs uppercase tracking-[0.2em] hover:bg-red-800 hover:shadow-lg transition-all duration-300 shadow-md">View Map Below</a>
                        </div>
                    </div>

                    {/* 4. Form (Spans 5 cols on XL) */}
                    <div className="xl:col-span-5 md:col-span-2 p-8 lg:p-10 rounded-[2rem] bg-white/80 backdrop-blur-2xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 h-full flex flex-col">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-full bg-festive-gold/10 flex items-center justify-center text-xl border border-festive-gold/20">✉️</div>
                            <h3 className="text-2xl font-black text-gray-900">Send a Message</h3>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="space-y-5 flex-grow flex flex-col justify-between">
                            <div className="space-y-5">
                                <div className="group/input">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/input:text-festive-purple transition-colors">Full Name</label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-white/50 border border-gray-200 text-gray-900 rounded-[1rem] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-festive-purple/20 focus:border-festive-purple transition-all focus:bg-white shadow-sm" placeholder="John Doe" />
                                </div>
                                <div className="group/input">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/input:text-festive-purple transition-colors">Phone Number</label>
                                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required className="w-full bg-white/50 border border-gray-200 text-gray-900 rounded-[1rem] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-festive-purple/20 focus:border-festive-purple transition-all focus:bg-white shadow-sm" placeholder="+91 00000 00000" />
                                </div>
                                <div className="group/input">
                                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1 group-focus-within/input:text-festive-purple transition-colors">Message</label>
                                    <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} required className="w-full bg-white/50 border border-gray-200 text-gray-900 rounded-[1.5rem] px-5 py-4 focus:outline-none focus:ring-2 focus:ring-festive-purple/20 focus:border-festive-purple transition-all focus:bg-white shadow-sm resize-none" placeholder="How can we help you?"></textarea>
                                </div>
                            </div>
                            
                            {toast && (
                                <div className={`px-4 py-3.5 rounded-xl text-center text-sm font-bold border transition-all duration-300 ${
                                    toast.type === 'success' 
                                        ? 'bg-green-500/10 border-green-500/20 text-green-600' 
                                        : 'bg-red-500/10 border-red-500/20 text-red-600'
                                }`}>
                                    {toast.message}
                                </div>
                            )}

                            <button type="submit" disabled={submitting} className={`w-full py-5 rounded-[1rem] text-white font-black uppercase tracking-[0.2em] text-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 mt-8 ${
                                submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-festive-purple hover:bg-festive-red hover:shadow-[0_15px_30px_rgba(185,28,28,0.25)]'
                            }`}>
                                {submitting ? 'Sending...' : 'Submit Message'}
                            </button>
                        </form>
                    </div>

                    {/* 5. Map (Spans 7 cols on XL) */}
                    <div id="map" className="xl:col-span-7 md:col-span-2 h-[500px] xl:h-auto rounded-[2.5rem] overflow-hidden border-[8px] border-white/80 backdrop-blur-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] transition-all duration-500 relative group">
                        <iframe 
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15732.551608630084!2d77.7919!3d9.4533!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b06cfe40d33f789%3A0x6a256d9a466185!2sSivakasi%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1715670000000!5m2!1sen!2sin" 
                            className="absolute inset-0 w-full h-full border-0 grayscale-[40%] opacity-90 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-1000"
                            allowFullScreen
                            loading="lazy" 
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                        {/* Interactive overlay that fades on hover to encourage interaction */}
                        <div className="absolute inset-0 bg-festive-purple/5 pointer-events-none group-hover:opacity-0 transition-opacity duration-700 mix-blend-multiply"></div>
                    </div>

                </div>
            </div>
        </section>
    )
}
