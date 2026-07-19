'use client';

import React, { useEffect, useRef, useState } from 'react';

export default function LoginTransition() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    // Trigger closing slide-out phase at 1.9 seconds
    const timer = setTimeout(() => {
      setIsClosing(true);
    }, 1900);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      decay: number;
      color: string;
      gravity: number;
      friction: number;
      size: number;

      constructor(x: number, y: number, color: string) {
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

      draw(c: CanvasRenderingContext2D) {
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
      x: number;
      y: number;
      tx: number;
      ty: number;
      vx: number;
      vy: number;
      color: string;
      exploded: boolean;

      constructor(sx: number, sy: number, tx: number, ty: number, color: string) {
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

      draw(c: CanvasRenderingContext2D) {
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

    const playExplosionSound = () => {
      const audio = new Audio('/assets/audio/bomb.mp3');
      audio.volume = 0.25; // Gentle volume to avoid being too loud
      audio.play().catch(() => {
        // Autoplay guard catch
      });
    };

    let rockets: Rocket[] = [];
    let particles: Particle[] = [];
    const colors = ['#fdb931', '#a855f7', '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#ef4444'];

    // Spawn massive multi-rocket launch on mount immediately
    const triggerInitialBurst = () => {
      const sxLeft = width * 0.2;
      const sxRight = width * 0.8;
      const sxCenter = width * 0.5;

      const targets = [
        { tx: width * 0.35, ty: height * 0.3 },
        { tx: width * 0.5, ty: height * 0.35 },
        { tx: width * 0.65, ty: height * 0.3 },
        { tx: width * 0.42, ty: height * 0.45 },
        { tx: width * 0.58, ty: height * 0.45 }
      ];

      targets.forEach((target, index) => {
        const sx = index % 3 === 0 ? sxLeft : index % 3 === 1 ? sxRight : sxCenter;
        const color = colors[index % colors.length];
        rockets.push(new Rocket(sx, height, target.tx, target.ty, color));
      });
    };

    triggerInitialBurst();

    const animate = () => {
      ctx.fillStyle = 'rgba(12, 4, 21, 0.18)';
      ctx.fillRect(0, 0, width, height);

      // Keep spawning random mini fireworks in background
      if (Math.random() < 0.05 && rockets.length < 3) {
        const sx = Math.random() * width;
        const tx = Math.random() * (width * 0.6) + (width * 0.2);
        const ty = Math.random() * (height * 0.5) + height * 0.1;
        const color = colors[Math.floor(Math.random() * colors.length)];
        rockets.push(new Rocket(sx, height, tx, ty, color));
      }

      rockets = rockets.filter((r) => {
        r.update();
        r.draw(ctx);
        if (r.exploded) {
          playExplosionSound();
          const numParticles = Math.floor(Math.random() * 60) + 60; // Denser explosions
          for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle(r.x, r.y, r.color));
          }
          return false;
        }
        return true;
      });

      particles = particles.filter((p) => {
        p.update();
        p.draw(ctx);
        return p.alpha > 0;
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-[#0c0415] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 ${
        isClosing ? 'animate-portal-unlock' : ''
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      
      <div className="relative z-10 text-center select-none pointer-events-none px-4">
        {/* Animated Key Unlock Spark */}
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-tr from-festive-gold/60 to-pink-500/60 rounded-full flex items-center justify-center border-2 border-festive-gold shadow-[0_0_50px_rgba(253,185,49,0.5)] animate-bounce">
          <span className="text-5xl animate-pulse">🔑</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-[0.2em] bg-gradient-to-r from-festive-gold via-pink-500 to-festive-gold bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(253,185,49,0.4)] animate-pulse">
          Access Granted
        </h2>
        
        <p className="text-gray-400 text-sm md:text-sm mt-3 font-bold uppercase tracking-[0.4em] text-festive-gold/80 animate-pulse">
          Launching Control Portal...
        </p>
      </div>
    </div>
  );
}
