"use client";

import Image from "next/image";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const trades = [
  {
    title: "Elytras / Movement",
    badge: "Escrow on",
    meta: "Starting at 14D",
    image: "/featured/elytra.webp",
  },
  {
    title: "Spawners / Farms",
    badge: "Escrow on",
    meta: "Popular",
    image: "/featured/spawner.webp",
  },
  {
    title: "Maces / PvP",
    badge: "Escrow on",
    meta: "Starting at 9D",
    image: "/featured/mace.png",
  },
  {
    title: "God Swords / Enchants",
    badge: "Escrow on",
    meta: "Hot listings",
    image: "/featured/sword.gif",
  },
];

export default function FeaturedTrades() {
  const { ref, isVisible } = useScrollReveal(0.15);

  return (
    <section className="container section perspective-1000" ref={ref}>
      <div className={`section-header reveal ${isVisible ? 'is-visible' : ''}`}>
        <span className="kicker">Featured trades</span>
        <h2 className="h2">Browse what's moving fast right now.</h2>
        <p className="p">
          High-demand categories with escrow on by default.
        </p>
      </div>
      <div className="grid-4 featured-grid preserve-3d">
        {trades.map((trade, i) => (
          <div
            key={trade.title}
            className={`card featured-card reveal tilt-6 ${isVisible ? 'is-visible' : ''}`}
            style={{ transitionDelay: `${i * 100}ms` }}
          >
            <div className="card-img featured-image">
              <Image
                src={trade.image}
                alt={trade.title}
                width={160}
                height={160}
                className="animate-float"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            </div>
            <div className="stack-6">
              <div className="featured-title" style={{ fontWeight: 600 }}>{trade.title}</div>
              <div className="featured-meta">
                <span className="pill pill-primary">{trade.badge}</span>
                <span className="pill pill-muted">{trade.meta}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
