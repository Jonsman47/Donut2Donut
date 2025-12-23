"use client";

import Image from "next/image";
import Link from "next/link";
import { useScrollReveal } from "@/hooks/useScrollReveal";

const steps = [
  {
    title: "Order created",
    body: "Buyer pays → escrow locks instantly.",
    image: "/featured/spawner.webp",
  },
  {
    title: "Seller delivers",
    body: "Timer starts + proof is required.",
    image: "/featured/elytra.webp",
  },
  {
    title: "Buyer confirms",
    body: "One click releases escrow safely.",
    image: "/featured/sword.gif",
  },
  {
    title: "Auto-resolve",
    body: "Disputes use evidence + mod review.",
    image: "/featured/mace.png",
  },
];

const rules = [
  "Proof required for high-value trades",
  "Disputes open for 48h",
  "Escrow auto-releases after confirmation window",
];

export default function EscrowHowItWorks() {
  const { ref, isVisible } = useScrollReveal(0.1);

  return (
    <section className="section escrow-section perspective-1000" ref={ref}>
      <div className="container">
        <div className={`section-header reveal ${isVisible ? 'is-visible' : ''}`}>
          <span className="kicker">How escrow works</span>
          <h2 className="h2">A safer flow for every trade.</h2>
          <p className="p">
            Every listing follows the same verified steps to keep both sides
            protected.
          </p>
        </div>
        <div className="escrow-steps preserve-3d">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`escrow-card glass-card reveal tilt-6 ${isVisible ? 'is-visible' : ''}`}
              style={{
                animationDelay: `${index * 150}ms`,
                transitionDelay: `${index * 100}ms`
              }}
            >
              <div className="escrow-card-top">
                <span className="escrow-number" style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
                  color: 'white',
                  border: 'none',
                  boxShadow: '0 8px 16px rgba(124, 58, 237, 0.3)',
                  width: 50,
                  height: 50,
                  fontSize: '1.1rem'
                }}>0{index + 1}</span>
              </div>
              <div className="escrow-card-content">
                <h3 className="h2" style={{ fontSize: '1.4rem' }}>{step.title}</h3>
                <p className="p" style={{ fontSize: '1rem', opacity: 0.85 }}>{step.body}</p>
              </div>
              <div className="escrow-card-image animate-float" style={{ right: -10, bottom: -10, opacity: 0.2, filter: 'blur(0px)', animationDelay: `${index * 0.2}s` }}>
                <Image src={step.image} alt="" width={180} height={180} />
              </div>
            </div>
          ))}
        </div>
        <div className={`escrow-chips reveal ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '600ms' }}>
          {rules.map((rule) => (
            <span key={rule} className="pill pill-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              ✦ {rule}
            </span>
          ))}
        </div>
        <div className={`escrow-cta reveal ${isVisible ? 'is-visible' : ''}`} style={{ transitionDelay: '700ms' }}>
          <Link className="btn btn-secondary" href="/rules">
            Read escrow rules
          </Link>
        </div>
      </div>
    </section>
  );
}
