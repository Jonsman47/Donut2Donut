"use client";

import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const TRADE_STEPS = [
  {
    title: "Step 1: Listing",
    body: "Player 1 lists an item (e.g., 1 pickaxe) on the site for €5, with full details (MC username, exact item, price). Player 2 sees the listing and sends a purchase request.",
    icon: "💎"
  },
  {
    title: "Step 2: Acceptance and Payment",
    body: "Player 1 accepts the request. Player 2 pays €5 via the site. The money is locked in escrow (secured). Both receive a unique code for the in-game exchange.",
    icon: "💳"
  },
  {
    title: "Step 3: Discreet In-game Exchange",
    body: "Both meet on Donut SMP. They exchange the item discreetly. Each person must record a short screen video proving the exchange (before/after inventory).",
    icon: "⚔️"
  },
  {
    title: "Step 4: Validation and Release",
    body: "They upload their video proof to the site and click 'Trade OK'. Once both validations are received, the money is automatically sent to the seller.",
    icon: "✅"
  }
];

export default function RulesPage() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal(0.1);
  const { ref: processRef, isVisible: processVisible } = useScrollReveal(0.1);
  const { ref: disputeRef, isVisible: disputeVisible } = useScrollReveal(0.1);

  return (
    <div className="rules-page" style={{ paddingBottom: 100 }}>
      {/* Header Section */}
      <section className="section perspective-1000" ref={headerRef}>
        <div className={`container reveal ${headerVisible ? 'is-visible' : ''}`} style={{ textAlign: 'center', paddingTop: 60 }}>
          <h1 className="h1 gradient-text text-shadow-premium" style={{ fontSize: '3.5rem', marginBottom: 16 }}>
            Marketplace Rules
          </h1>
          <p className="p" style={{ fontSize: '1.25rem', opacity: 0.8, maxWidth: 600, margin: '0 auto' }}>
            A simple, secure, and transparent system for all your trades on DonutSMP.
          </p>
        </div>
      </section>

      {/* Main Process Section */}
      <section className="section perspective-1000" ref={processRef} style={{ marginTop: 80 }}>
        <div className="container">
          <div className={`section-header reveal ${processVisible ? 'is-visible' : ''}`} style={{
            textAlign: 'center',
            marginBottom: 60,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginInline: 'auto',
            maxWidth: '800px'
          }}>
            <span className="kicker">The Process</span>
            <h2 className="h2" style={{ fontSize: '2.4rem' }}>How does a trade work?</h2>
          </div>

          <div className="grid-2 preserve-3d" style={{ gap: 24 }}>
            {TRADE_STEPS.map((step, i) => (
              <div
                key={i}
                className={`glass-card reveal tilt-6 ${processVisible ? 'is-visible' : ''}`}
                style={{
                  padding: 40,
                  borderRadius: 24,
                  transitionDelay: `${i * 150}ms`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16
                }}
              >
                <div style={{ fontSize: '2.5rem' }}>{step.icon}</div>
                <h3 className="h2" style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>{step.title}</h3>
                <p className="p" style={{ fontSize: '1.05rem', lineHeight: 1.6, opacity: 0.9 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disputes Section */}
      <section className="section perspective-1000" ref={disputeRef} style={{ marginTop: 100 }}>
        <div className="container">
          <div className={`glass-card reveal ${disputeVisible ? 'is-visible' : ''}`} style={{
            padding: 60,
            borderRadius: 32,
            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
            border: '1px solid rgba(124, 58, 237, 0.2)',
            boxShadow: '0 24px 60px rgba(0,0,0,0.2)'
          }}>
            <h2 className="h2" style={{ fontSize: '2.2rem', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
              <span>⚠️</span> Dispute Management
            </h2>
            <div className="stack-20">
              <p className="p" style={{ fontSize: '1.15rem', opacity: 0.9 }}>
                In case of rules violation (proven scam, no video), the dispute is analyzed by our team.
              </p>
              <ul className="list animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0 }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 900 }}>✦</span>
                  <span><strong>Video Analysis</strong>: If the scam is confirmed, the money is returned to the victim.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 900 }}>✦</span>
                  <span><strong>Sanctions</strong>: The scammer is permanently banned and reported to the community.</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ color: 'var(--primary)', fontWeight: 900 }}>✦</span>
                  <span><strong>Responsiveness</strong>: Maximum 48h delay to resolve long blocks.</span>
                </li>
              </ul>
            </div>

            <div style={{ marginTop: 40, display: 'flex', gap: 16 }}>
              <Link href="/market" className="btn btn-primary btn-glow" style={{ padding: '14px 32px', borderRadius: 12 }}>
                Start Trading
              </Link>
              <Link href="/" className="btn btn-secondary" style={{ padding: '14px 32px', borderRadius: 12, background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}>
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Decorative Glows */}
      <div className="hero-glow hero-glow-top" style={{ opacity: 0.4 }} />
      <div className="hero-glow hero-glow-bottom" style={{ opacity: 0.3 }} />
    </div>
  );
}
