"use client";
import { useEffect, useRef, useState } from "react";

export default function Loader() {
  const [hideLoader, setHideLoader] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Check if user has visited in this session
    const hasVisited = sessionStorage.getItem("visited");

    if (!hasVisited) {
      setShowButton(true);
      audioRef.current = new Audio("/assets/audio/bomb.mp3");
      audioRef.current.volume = 1;
    } else {
      // Refresh case: Hide loader after 2.5 seconds
      setTimeout(() => {
        setHideLoader(true);
      }, 2500);
    }
  }, []);

  const handleEnterSite = () => {
    // Play audio only when button is clicked (Browser allows)
    if (audioRef.current) {
      audioRef.current.play().catch((err) => console.error("Audio play error:", err));
    }

    // Mark as visited
    sessionStorage.setItem("visited", "true");

    // Hide loader
    setHideLoader(true);
  };

  if (hideLoader) return null;

  return (
    <div className="fixed inset-0 flex flex-col justify-center items-center bg-[#06010f] z-[9999]">
      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 bg-amber-400/20 blur-3xl rounded-full animate-pulse"></div>
        <img
          src="/assets/images/sri_dhakshina_logo.jpg"
          alt="Loading..."
          className="relative w-64 h-64 md:w-80 md:h-80 rounded-full object-cover mb-8 shadow-[0_0_40px_rgba(255,215,0,0.4)] animate-pulse"
        />

        {!showButton && (
          <div className="flex gap-1 items-center text-amber-400 font-black tracking-[0.3em] uppercase text-sm mt-4 animate-pulse">
            LOADING PLEASE WAIT...
          </div>
        )}
      </div>

      {showButton && (
        <button
          onClick={handleEnterSite}
          className="mt-6 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 px-10 py-4 rounded-full font-black text-lg uppercase tracking-widest shadow-[0_0_25px_rgba(255,215,0,0.5)] hover:scale-110 active:scale-95 transition-transform"
        >
          🚀 ENTER WEBSITE
        </button>
      )}
    </div>
  );
}
