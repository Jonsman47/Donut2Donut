"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

const reviews = [
  {
    name: "@mineshaft",
    text: "Escrow by default makes trades feel instant and safe.",
    date: "Mar 12, 2025",
  },
  {
    name: "@donutcore",
    text: "Proof-first delivery keeps every listing clean.",
    date: "Apr 2, 2025",
  },
  {
    name: "@embervault",
    text: "Fast dispute handling is the reason we moved here.",
    date: "Apr 18, 2025",
  },
];

export default function ReviewsStrip() {
  const { ref, isVisible } = useScrollReveal(0.2);

  return (
    <section className="section reviews-section perspective-1000" ref={ref}>
      <div className="container preserve-3d">
        <h2 className={`h2 reveal ${isVisible ? 'is-visible' : ''}`} style={{ marginBottom: 32 }}>What traders say</h2>
        <div className="reviews-grid">
          {reviews.map((r, i) => (
            <div
              key={i}
              className={`review-card glass-card reveal tilt-6 ${isVisible ? 'is-visible' : ''}`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              <div className="review-stars" style={{ color: '#fbbf24', fontSize: '1.2rem' }}>{"★★★★★"}</div>
              <p className="p" style={{ fontSize: '1.05rem', fontStyle: 'italic', opacity: 0.9 }}>"{r.text}"</p>
              <div className="muted" style={{ fontWeight: 600 }}>— {r.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
