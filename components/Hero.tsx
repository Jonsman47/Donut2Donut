import Link from "next/link";
import HeroVideoBG from "@/components/HeroVideoBG";

export default function Hero() {
  return (
    <section className="section hero-section">
      <HeroVideoBG />
      <div className="container hero-content">
        <div className="hero-panel">
          <h1 className="h1 gradient-text">Trust-first trades for DonutSMP</h1>
          <p className="p hero-subtitle">
            Escrow by default. Proof-based delivery. Fast dispute handling.
          </p>
          <div className="hero-notice glass-card">
            Instant delivery available via bots for supported items — escrow
            stays locked until confirmed.
          </div>
          <div className="hero-cta">
            <Link className="btn btn-primary" href="/market">
              Get started
            </Link>
            <Link className="btn btn-secondary" href="/rules">
              How escrow works
            </Link>
          </div>
          <div className="hero-pills">
            <span className="pill pill-primary">Escrow default</span>
            <span className="pill pill-secondary">Proof required</span>
            <span className="pill pill-muted">48h disputes</span>
          </div>
        </div>
      </div>
    </section>
  );
}
