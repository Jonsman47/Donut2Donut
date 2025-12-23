"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function FinalCTA() {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section className="section final-cta perspective-1000" ref={ref} style={{ paddingBottom: 100 }}>
      <div className="container preserve-3d">
        <div className={`final-cta-card reveal ${isVisible ? 'is-visible' : ''}`} style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)',
          color: 'white',
          padding: '60px 40px',
          borderRadius: 32,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          boxShadow: '0 24px 60px rgba(124, 58, 237, 0.4)',
        }}>
          <div className="stack-10">
            <h2 className="h1" style={{ color: 'white' }}>Ready to trade safely?</h2>
            <p className="p" style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.2rem' }}>Start a secure trade in under a minute with escrow protection.</p>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Link className="btn btn-primary tilt-6" href="/market" style={{
              background: 'white',
              color: 'var(--primary)',
              padding: '16px 48px',
              fontSize: '1.2rem',
              border: 'none',
              boxShadow: '0 8px 24px rgba(0,0,0,0.1)'
            }}>
              Get started
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
