'use client';

import React, { useEffect, useRef } from 'react';

export default function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    const isMobile = width < 768;

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Exploding Particle class
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

      constructor(x: number, y: number, color: string) {
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

      draw(c: CanvasRenderingContext2D) {
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

      draw(c: CanvasRenderingContext2D) {
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

    let rockets: Rocket[] = [];
    let particles: Particle[] = [];
    const colors = ['#fdb931', '#a855f7', '#f59e0b', '#ec4899', '#3b82f6', '#10b981', '#ef4444'];

    const spawnFirework = () => {
      const sx = Math.random() * width;
      const sy = height;
      const tx = Math.random() * (width * 0.8) + (width * 0.1);
      const ty = Math.random() * (height * 0.45) + height * 0.1;
      const color = colors[Math.floor(Math.random() * colors.length)];
      rockets.push(new Rocket(sx, sy, tx, ty, color));
    };

    const animate = () => {
      // Create trailing blur overlay
      ctx.fillStyle = 'rgba(13, 4, 21, 0.16)';
      ctx.fillRect(0, 0, width, height);

      // Random launch spawn logic
      if (Math.random() < (isMobile ? 0.025 : 0.03) && rockets.length < (isMobile ? 2 : 4)) {
        spawnFirework();
      }

      // Update rockets
      rockets = rockets.filter((r) => {
        r.update();
        r.draw(ctx);
        if (r.exploded) {
          // Create bursts of sparks
          const numParticles = isMobile
            ? Math.floor(Math.random() * 15) + 15
            : Math.floor(Math.random() * 40) + 40;
          for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle(r.x, r.y, r.color));
          }
          return false;
        }
        return true;
      });

      // Update particles
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" style={{ mixBlendMode: 'screen' }} />;
}
