"use client";

import Link from "next/link";
import HeroVideoBG from "@/components/HeroVideoBG";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function Hero() {
  const { ref, isVisible } = useScrollReveal(0.05);

  return (
    <section className="section hero-section perspective-1000" ref={ref} style={{ overflow: 'visible' }}>
      <HeroVideoBG />

      {/* Decorative Glows */}
      <div className="hero-glow hero-glow-top" />
      <div className="hero-glow hero-glow-bottom" />
      <div className="container hero-content preserve-3d">
        <div className={`hero-panel reveal ${isVisible ? 'is-visible' : ''}`}>
          <div className="animate-fade-up">
            <h1 className="h1 gradient-text text-shadow-premium" style={{ paddingBottom: '12px', fontSize: 'clamp(3rem, 6vw, 4.5rem)' }}>
              Trust-first trades for DonutSMP
            </h1>
          </div>

          <div className="animate-fade-up delay-100">
            <p className="p hero-subtitle" style={{ fontSize: '1.4rem', opacity: 0.8, color: '#f8fafc', fontWeight: 400, letterSpacing: '0.01em' }}>
              Escrow by default. Proof-based delivery. Fast dispute handling.
            </p>
          </div>

          <div className="hero-cta animate-fade-up delay-300" style={{ marginTop: 24 }}>
            <Link className="btn btn-primary btn-glow" href="/market" style={{ padding: '16px 40px', fontSize: '1.15rem', borderRadius: '16px' }}>
              Get started
            </Link>
            <Link className="btn btn-secondary glass-card" href="/rules" style={{ color: 'white', padding: '16px 40px', fontSize: '1.15rem', borderColor: 'rgba(255,255,255,0.15)', borderRadius: '16px' }}>
              How escrow works
            </Link>
          </div>

          <div className="hero-pills animate-fade-up delay-400" style={{ marginTop: 20 }}>
            <span className="pill pill-primary animate-float tilt-6" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#a78bfa' }}>Escrow default</span>
            <span className="pill pill-secondary animate-float tilt-6" style={{ animationDelay: '0.5s', background: 'rgba(37, 99, 235, 0.2)', color: '#60a5fa' }}>Proof required</span>
            <span className="pill pill-muted animate-float tilt-6" style={{ animationDelay: '1s', background: 'rgba(148, 163, 184, 0.1)', color: '#94a3b8' }}>48h disputes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
